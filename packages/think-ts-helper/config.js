'use strict';

const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const slash = value => value.split(path.sep).join('/');
const object = children => ({kind: 'object', children: children || new Map()});

function fail(code, message) {
  const error = new Error(`${code}: ${message}`);
  error.code = code;
  throw error;
}

// This deliberately bounded parser never imports or evaluates application code.
// Only shapes whose lodash.merge behavior is known are accepted. In particular,
// arrays, spreads, getters, factories and computed/dynamic values are not guessed.
function parseConfig(file, reference, system = false) {
  const source = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
  const unsupported = reason => fail('UNSUPPORTED_CONFIG', `${file}: ${reason}`);
  if (source.parseDiagnostics.length) unsupported('source cannot be parsed by TypeScript 3.9');
  const typeTags = new Set(['type', 'typedef', 'param', 'arg', 'argument', 'returns', 'return', 'property', 'prop', 'enum', 'extends', 'augments', 'implements', 'template', 'this', 'callback', 'constructor', 'class', 'satisfies', 'overload']);
  function inspectDocumentation(node) {
    const comments = [...(ts.getLeadingCommentRanges(source.text, node.pos) || []), ...(ts.getTrailingCommentRanges(source.text, node.pos) || [])];
    const annotated = comments.some(comment => {
      const text = source.text.slice(comment.pos, comment.end);
      return text.startsWith('/**') && [...text.matchAll(/@([a-z]+)\b/g)].some(match => typeTags.has(match[1]));
    });
    if (annotated || ts.getJSDocTags(node).some(tag => typeTags.has(tag.tagName.text))) unsupported('JSDoc type annotations are unsupported; use unannotated static exports or an explicit ConfigModules schema');
    ts.forEachChild(node, inspectDocumentation);
  }
  inspectDocumentation(source);
  const variables = new Map();
  const resolving = new Set();
  const exports = [];
  let style;
  const mark = value => {
    if (style && style !== value) unsupported('mixed export styles');
    style = value;
  };
  const keyOf = name => {
    if (!name || !(ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name))) unsupported('computed property names');
    const key = name.text;
    if (!key || key.includes('.') || key in Object.prototype || /^__proto__|prototype|construcotr$/.test(key) || key === '__esModule') unsupported(`unsafe or inaccessible key ${JSON.stringify(key)}`);
    return key;
  };
  const access = node => {
    if (ts.isIdentifier(node)) return node.text;
    if (ts.isPropertyAccessExpression(node)) return access(node.expression) + '.' + node.name.text;
    return '';
  };
  for (const statement of source.statements) {
    if (ts.isVariableStatement(statement)) {
      if (!(statement.declarationList.flags & ts.NodeFlags.Const)) unsupported('use const declarations');
      for (const declaration of statement.declarationList.declarations) {
        if (!ts.isIdentifier(declaration.name) || !declaration.initializer || declaration.type) unsupported('use unannotated const identifiers with static initializers');
        if (variables.has(declaration.name.text)) unsupported('duplicate declarations');
        variables.set(declaration.name.text, declaration.initializer);
        if ((statement.modifiers || []).some(modifier => modifier.kind === ts.SyntaxKind.ExportKeyword)) {
          mark('namespace');
          exports.push({keys: [keyOf(declaration.name)], value: declaration.initializer});
        }
      }
    } else if (ts.isExportAssignment(statement)) {
      mark(statement.isExportEquals ? 'assignment' : 'namespace');
      exports.push({keys: statement.isExportEquals ? [] : ['default'], value: statement.expression});
    } else if (ts.isExpressionStatement(statement) && ts.isStringLiteral(statement.expression)) {
      // Directive prologues do not affect the exported shape.
    } else if (ts.isExpressionStatement(statement) && ts.isBinaryExpression(statement.expression) && statement.expression.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
      const assignment = statement.expression;
      const target = access(assignment.left);
      mark('commonjs');
      if (target === 'module.exports') exports.push({keys: [], value: assignment.right});
      else if (/^(exports|module\.exports)\.[^.]+$/.test(target)) {
        const key = keyOf(assignment.left.name);
        exports.push({keys: [key], value: assignment.right});
      } else unsupported('only direct module.exports or exports.key assignments are supported');
    } else unsupported('only static const declarations and direct exports are supported');
  }
  if (!exports.length) unsupported('no explicit config export');
  if (style === 'commonjs' && file.endsWith('.ts')) unsupported('CommonJS assignments in .ts do not expose TypeScript module exports; use const config = {...}; export = config, or a .js source');
  const scalarType = node => {
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return 'string';
    if (ts.isNumericLiteral(node)) return 'number';
    if (node.kind === ts.SyntaxKind.TrueKeyword || node.kind === ts.SyntaxKind.FalseKeyword) return 'boolean';
    if (node.kind === ts.SyntaxKind.NullKeyword) return 'null';
    if (ts.isIdentifier(node) && node.text === 'undefined') return 'undefined';
    if (ts.isArrowFunction(node) || ts.isFunctionExpression(node)) return 'unknown';
    if (ts.isPrefixUnaryExpression(node) && [ts.SyntaxKind.PlusToken, ts.SyntaxKind.MinusToken].includes(node.operator) && scalarType(node.operand) === 'number') return 'number';
    if (ts.isBinaryExpression(node) && [ts.SyntaxKind.PlusToken, ts.SyntaxKind.MinusToken, ts.SyntaxKind.AsteriskToken, ts.SyntaxKind.SlashToken, ts.SyntaxKind.PercentToken, ts.SyntaxKind.AsteriskAsteriskToken].includes(node.operatorToken.kind) && scalarType(node.left) === 'number' && scalarType(node.right) === 'number') return 'number';
    return null;
  };
  function shape(node, keys) {
    if (ts.isParenthesizedExpression(node)) return shape(node.expression, keys);
    if (ts.isAsExpression(node) && node.type.getText(source) === 'const') return shape(node.expression, keys);
    if (ts.isIdentifier(node) && variables.has(node.text)) {
      if (resolving.has(node.text)) unsupported('cyclic config references');
      resolving.add(node.text);
      const value = shape(variables.get(node.text), keys);
      resolving.delete(node.text);
      return value;
    }
    if (ts.isObjectLiteralExpression(node)) {
      const children = new Map();
      for (const property of node.properties) {
        if (!ts.isPropertyAssignment(property) && !ts.isShorthandPropertyAssignment(property)) unsupported('spreads, methods and accessors are not supported; use static properties');
        const key = keyOf(property.name);
        if (children.has(key)) unsupported(`duplicate property ${key}`);
        children.set(key, shape(ts.isPropertyAssignment(property) ? property.initializer : property.name, [...keys, key]));
      }
      return object(children);
    }
    const scalar = scalarType(node);
    if (!scalar) unsupported('arrays and dynamic values need an explicit ConfigModules schema; omit --configs');
    return {kind: scalar === 'undefined' ? 'undefined' : 'leaf', type: system || scalar === 'undefined' || scalar === 'null' ? scalar : reference + keys.map(key => `[${JSON.stringify(key)}]`).join('')};
  }
  // Reject side-effecting or mutable local initializers even if not exported.
  for (const value of variables.values()) shape(value, []);
  let result = object();
  const assigned = new Set();
  for (const entry of exports) {
    const name = entry.keys.join('.');
    if (assigned.has(name) || (!entry.keys.length && assigned.size) || (entry.keys.length && assigned.has(''))) unsupported('duplicate or mixed whole-object/property assignments');
    assigned.add(name);
    const value = shape(entry.value, entry.keys);
    if (!entry.keys.length) {
      if (value.kind !== 'object') unsupported('config exports must be objects, not factories');
      result = value;
    } else result.children.set(entry.keys[0], value);
  }
  return result;
}

// lodash.merge recurses into plain objects and skips an undefined source value
// when a previous value exists. Arrays are diagnosed, not shallowly replaced.
function merge(left, right) {
  if (right.kind === 'undefined') return left || right;
  if (right.kind !== 'object') return right;
  const children = new Map(left && left.kind === 'object' ? left.children : []);
  for (const [key, value] of right.children) children.set(key, merge(children.get(key), value));
  return object(children);
}

function typeOf(nodes) {
  const present = nodes.filter(Boolean);
  let types;
  if (present.every(node => node.kind === 'object')) {
    const keys = [...new Set(present.flatMap(node => [...node.children.keys()]))].sort();
    types = ['{ ' + keys.map(key => {
      const children = present.map(node => node.children.get(key));
      return `${JSON.stringify(key)}${children.some(value => !value) ? '?' : ''}: ${typeOf(children)};`;
    }).join(' ') + ' }'];
  } else {
    types = present.map(node => node.kind === 'object' ? typeOf([node]) : node.type);
  }
  if (nodes.some(node => !node)) types.push('undefined');
  return [...new Set(types)].sort().join(' | ');
}

function flatten(tree, prefix = '', output = new Map()) {
  for (const [key, value] of tree.children) {
    const name = prefix + key;
    output.set(name, value);
    if (value.kind === 'object') flatten(value, name + '.', output);
  }
  return output;
}

function generateConfigs({root, source, output, multi, moduleNames, header}) {
  if (moduleNames.some(name => !name || name.includes(',') || name === '__proto__')) fail('CONFIG_RESERVED_MODULE', 'Config module names must be nonempty, comma-free and not __proto__');
  const sources = new Map();
  const environments = new Set();
  for (const module of moduleNames) {
    const dir = path.join(source, multi ? module : '', 'config');
    const files = new Map();
    if (fs.existsSync(dir)) {
      if (fs.lstatSync(dir).isSymbolicLink()) fail('UNSUPPORTED_SYMLINK', dir);
      for (const entry of fs.readdirSync(dir, {withFileTypes: true}).sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0)) {
        if (!/^(config|adapter)(?:\..+)?\.(ts|js)$/.test(entry.name) || /\.d\.ts$/.test(entry.name)) continue;
        const file = path.join(dir, entry.name);
        if (entry.isSymbolicLink()) fail('UNSUPPORTED_SYMLINK', file);
        if (!entry.isFile()) continue;
        if (entry.name.startsWith('adapter.')) fail('UNSUPPORTED_CONFIG_ADAPTER', `${file}: adapter normalization needs an explicit ConfigModules schema; omit --configs`);
        const name = entry.name.replace(/\.(ts|js)$/, '');
        if ([...files.keys()].some(key => key.toLowerCase() === name.toLowerCase())) fail('CONFIG_COLLISION', file);
        files.set(name, file);
        if (name !== 'config') environments.add(name.slice('config.'.length));
      }
    }
    sources.set(module, files);
  }
  let systemFile;
  try { systemFile = require.resolve('thinkjs/lib/config/config.js', {paths: [root]}); } catch {
    fail('CONFIG_SYSTEM_NOT_FOUND', 'Install thinkjs in the application so its actual system defaults can be inspected');
  }
  const system = parseConfig(systemFile, '', true);
  const parsed = new Map();
  const reference = file => {
    let ref = slash(path.relative(output, file)).replace(/\.(ts|js)$/, '');
    if (!ref.startsWith('.')) ref = './' + ref;
    return `typeof import(${JSON.stringify(ref)})`;
  };
  for (const files of sources.values()) for (const file of files.values()) parsed.set(file, parseConfig(file, reference(file)));
  const envs = [...environments].sort();
  const modules = {};
  const lines = [header.trimEnd(), "import 'think-config/config-types';", '', "declare module 'think-config/config-types' {", '  interface ConfigModules {'];
  for (const module of moduleNames) {
    const names = multi && module !== 'common' ? ['common', module] : [module];
    const base = names.flatMap(name => sources.get(name).has('config') ? [sources.get(name).get('config')] : []);
    const envFiles = Object.fromEntries(envs.map(env => [env, names.flatMap(name => sources.get(name).has('config.' + env) ? [sources.get(name).get('config.' + env)] : [])]));
    Object.defineProperty(modules, module, {value: {base: base.map(file => slash(path.relative(root, file))), environments: Object.fromEntries(envs.map(env => [env, envFiles[env].map(file => slash(path.relative(root, file)))]))}, enumerable: true});
    // Always include a base-only environment. Runtime env is not limited to the
    // files seen during generation, so env-only fields remain optional.
    const variants = [[], ...envs.map(env => envFiles[env])].map(files => {
      const app = [...base, ...files].reduce((value, file) => merge(value, parsed.get(file)), object());
      return flatten(merge(system, app));
    });
    const keys = [...new Set(variants.flatMap(variant => [...variant.keys()]))].sort();
    lines.push(`    ${JSON.stringify(module)}: {`);
    for (const key of keys) lines.push(`      ${JSON.stringify(key)}: ${typeOf(variants.map(variant => variant.get(key)))};`);
    lines.push('    };');
  }
  lines.push('  }', '}', '');
  return {declaration: lines.join('\n'), manifest: {environments: envs, modules}};
}

module.exports = {generateConfigs};
