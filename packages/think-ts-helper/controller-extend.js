'use strict';

const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const slash = value => value.split(path.sep).join('/');

function fail(code, message) {
  const error = new Error(`${code}: ${message}`);
  error.code = code;
  throw error;
}

// A bounded syntax reader, not an evaluator. Keep property types/getter
// readonlyness in the source instead of reproducing method signatures here.
function parse(file, reference, config) {
  const source = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
  const unsupported = reason => fail('UNSUPPORTED_CONTROLLER_EXTEND', `${file}: ${reason}`);
  if (!file.endsWith('.ts') || source.parseDiagnostics.length) unsupported('use TypeScript 3.9-compatible .ts sources');
  const variables = new Map();
  const resolving = new Set();
  let exported;
  let selector = '';
  function keyOf(name) {
    if (!name || !(ts.isIdentifier(name) || ts.isStringLiteral(name))) unsupported('numeric/computed names and spreads need explicit extension types');
    const key = name.text;
    if (!key || key in Object.prototype || key === 'prototype' || key === '__esModule') unsupported(`unsafe extension member ${JSON.stringify(key)}`);
    return key;
  }
  for (const statement of source.statements) {
    if (ts.isImportDeclaration(statement) && statement.importClause && statement.importClause.isTypeOnly) continue;
    if (ts.isInterfaceDeclaration(statement) || ts.isTypeAliasDeclaration(statement)) continue;
    if (ts.isExpressionStatement(statement) && ts.isStringLiteral(statement.expression)) continue;
    if (ts.isVariableStatement(statement)) {
      if (!(statement.declarationList.flags & ts.NodeFlags.Const) || statement.modifiers) unsupported('use unexported const declarations and one explicit export');
      for (const declaration of statement.declarationList.declarations) {
        if (!ts.isIdentifier(declaration.name) || !declaration.initializer || declaration.type) unsupported('shape-changing annotations and destructuring are unsupported');
        if (variables.has(declaration.name.text)) unsupported('duplicate declarations');
        variables.set(declaration.name.text, declaration.initializer);
      }
    } else if (ts.isExportAssignment(statement)) {
      if (exported) unsupported('multiple exports');
      exported = statement.expression;
      selector = statement.isExportEquals ? '' : '.default';
    } else unsupported('only type imports/declarations, static const values and an explicit export are supported');
  }
  if (!exported) unsupported('expected export default or export =');
  function resolve(node, callback) {
    if (ts.isParenthesizedExpression(node)) return resolve(node.expression, callback);
    if (ts.isAsExpression(node) && node.type.getText(source) === 'const') return resolve(node.expression, callback);
    if (ts.isIdentifier(node) && variables.has(node.text)) {
      if (resolving.has(node.text)) unsupported('cyclic const references');
      resolving.add(node.text);
      const result = resolve(variables.get(node.text), callback);
      resolving.delete(node.text);
      return result;
    }
    return callback(node);
  }
  function validateValue(node) {
    resolve(node, value => {
      if (ts.isObjectLiteralExpression(value)) { members(value); return; }
      if (ts.isArrayLiteralExpression(value)) { value.elements.forEach(validateValue); return; }
      if (ts.isStringLiteral(value) || ts.isNoSubstitutionTemplateLiteral(value) || ts.isNumericLiteral(value) ||
        ts.isFunctionExpression(value) || ts.isArrowFunction(value) ||
        [ts.SyntaxKind.TrueKeyword, ts.SyntaxKind.FalseKeyword, ts.SyntaxKind.NullKeyword].includes(value.kind) ||
        (ts.isIdentifier(value) && value.text === 'undefined')) return;
      if (ts.isPrefixUnaryExpression(value) && [ts.SyntaxKind.PlusToken, ts.SyntaxKind.MinusToken].includes(value.operator) && ts.isNumericLiteral(value.operand)) return;
      unsupported('dynamic expressions, assertions, spreads and mutable initializers need explicit extension types');
    });
  }
  function members(node) {
    return resolve(node, value => {
      if (!ts.isObjectLiteralExpression(value)) unsupported('extensions must be static object literals');
      const result = new Map();
      for (const property of value.properties) {
        const name = keyOf(property.name);
        const accessor = ts.isGetAccessor(property) || ts.isSetAccessor(property);
        if (!accessor && !ts.isMethodDeclaration(property) && !ts.isPropertyAssignment(property) && !ts.isShorthandPropertyAssignment(property)) unsupported('unsupported object member');
        const kind = ts.isGetAccessor(property) ? 'get' : ts.isSetAccessor(property) ? 'set' : 'value';
        const previous = result.get(name);
        if (previous && !(accessor && previous.kind !== 'value' && !previous.kinds.includes(kind))) unsupported(`duplicate member ${name}`);
        const kinds = previous ? [...previous.kinds, kind] : [kind];
        result.set(name, {kind: accessor ? 'accessor' : 'value', kinds});
        if (ts.isPropertyAssignment(property)) validateValue(property.initializer);
        if (ts.isShorthandPropertyAssignment(property)) validateValue(property.name);
      }
      for (const [name, descriptor] of result) {
        if (descriptor.kind === 'accessor' && !descriptor.kinds.includes('get')) unsupported(`setter-only member ${name} has no sound readable property type`);
      }
      return result;
    });
  }
  // Check even unused initializers so a supposedly static file cannot quietly
  // mutate an exported object during module initialization.
  for (const value of variables.values()) validateValue(value);
  const base = reference + selector;
  const layers = [];
  function plugin(node, ref) {
    resolve(node, value => {
      if (!ts.isObjectLiteralExpression(value) || value.properties.length !== 1) unsupported('this slice supports only a controller-only plugin object');
      const property = value.properties[0];
      if (!ts.isPropertyAssignment(property) || keyOf(property.name) !== 'controller') unsupported('this slice supports only a controller-only plugin object');
      layers.push({reference: ref + '["controller"]', members: members(property.initializer)});
    });
  }
  if (!config) layers.push({reference: base, members: members(exported)});
  else resolve(exported, value => {
    if (!ts.isArrayLiteralExpression(value)) { plugin(value, base); return; }
    // Without a tuple assertion, typeof import(...)[0] is a union of all
    // elements and cannot describe the loader's ordered overrides honestly.
    function tuple(node) {
      if (ts.isParenthesizedExpression(node)) return tuple(node.expression);
      if (ts.isIdentifier(node) && variables.has(node.text)) return tuple(variables.get(node.text));
      return ts.isAsExpression(node) && node.type.getText(source) === 'const';
    }
    if (!tuple(exported)) unsupported('plugin arrays must use as const to preserve ordered tuple element types');
    value.elements.forEach((item, index) => plugin(item, `${base}[${index}]`));
  });
  return layers;
}

function generateControllerExtends({root, source, output, multi, header}) {
  const directory = path.join(source, multi ? 'common' : '');
  const relative = file => slash(path.relative(root, file));
  function find(dir, basename) {
    const folder = path.join(directory, dir);
    if (!fs.existsSync(folder)) return;
    if (fs.lstatSync(folder).isSymbolicLink()) fail('UNSUPPORTED_SYMLINK', folder);
    const matches = fs.readdirSync(folder).filter(name => name.toLowerCase() === basename + '.ts' || name.toLowerCase() === basename + '.js');
    if (matches.length > 1) fail('CONTROLLER_EXTEND_COLLISION', relative(folder));
    if (!matches.length) return;
    if (matches[0] !== basename + '.ts' && matches[0] !== basename + '.js') fail('CONTROLLER_EXTEND_CASE', relative(folder) + '/' + matches[0]);
    const file = path.join(folder, matches[0]);
    if (fs.lstatSync(file).isSymbolicLink()) fail('UNSUPPORTED_SYMLINK', file);
    return file;
  }
  const files = [find('config', 'extend'), find('extend', 'controller')].filter(Boolean);
  let systemFile;
  try { systemFile = require.resolve('thinkjs/lib/extend/controller.js', {paths: [root]}); } catch {
    fail('CONTROLLER_EXTEND_SYSTEM_NOT_FOUND', 'Install thinkjs so its actual system Controller extensions can be inspected');
  }
  const systemSource = ts.createSourceFile(systemFile, fs.readFileSync(systemFile, 'utf8'), ts.ScriptTarget.Latest, true);
  const systemExport = systemSource.statements.find(statement => ts.isExpressionStatement(statement) &&
    ts.isBinaryExpression(statement.expression) && statement.expression.left.getText(systemSource) === 'module.exports');
  if (!systemExport || !ts.isObjectLiteralExpression(systemExport.expression.right)) fail('UNSUPPORTED_CONTROLLER_SYSTEM', systemFile);
  // The current instance owns ctx. model may be installed by the explicit
  // Model view; overriding these would invalidate the earlier contracts.
  const reserved = new Set(['ctx', 'model', ...systemExport.expression.right.properties.map(property => property.name.text)]);
  const effective = new Map();
  const layers = [];
  const overrides = [];
  for (const file of files) {
    let ref = slash(path.relative(output, file)).replace(/\.(ts|js)$/, '');
    if (!ref.startsWith('.')) ref = './' + ref;
    for (const layer of parse(file, `typeof import(${JSON.stringify(ref)})`, path.basename(file).startsWith('extend.'))) {
      const index = layers.length;
      layers.push({...layer, file: relative(file)});
      for (const [name, descriptor] of layer.members) {
        if (reserved.has(name)) fail('CONTROLLER_EXTEND_RESERVED', `${relative(file)}: overriding core Controller member ${name} needs an explicit type contract`);
        const previous = effective.get(name);
        if (previous) {
          if (previous.kind === 'accessor' && descriptor.kind === 'value') fail('CONTROLLER_EXTEND_DESCRIPTOR', `${relative(file)}: data member ${name} cannot safely replace an accessor; the runtime assigns through its setter or preserves the old getter`);
          if (previous.kind === 'accessor' && descriptor.kind === 'accessor' && previous.kinds.some(kind => !descriptor.kinds.includes(kind))) fail('CONTROLLER_EXTEND_DESCRIPTOR', `${relative(file)}: partial accessor override ${name} retains the previous getter/setter at runtime`);
          overrides.push({name, previous: layers[previous.layer].file, next: relative(file), previousLayer: previous.layer, nextLayer: index});
        }
        effective.set(name, {...descriptor, layer: index});
      }
    }
  }
  const picks = layers.map((layer, index) => {
    const names = [...effective].filter(([, descriptor]) => descriptor.layer === index).map(([name]) => name).sort();
    return names.length ? `Pick<${layer.reference}, ${names.map(JSON.stringify).join(' | ')}>` : null;
  }).filter(Boolean);
  const declaration = header +
    `export type ControllerExtension = ${picks.length ? picks.join(' &\n  ') : '{}'};\n` +
    'export type ControllerExtends<T> = Pick<T, Exclude<keyof T, keyof ControllerExtension>> & ControllerExtension;\n';
  return {declaration, manifest: {files: files.map(relative), members: [...effective.keys()].sort(), overrides},
    diagnostics: overrides.map(item => ({code: 'CONTROLLER_EXTEND_OVERRIDE', message: `${item.name}: layer ${item.previousLayer} (${item.previous}) is replaced by layer ${item.nextLayer} (${item.next}); check compatibility at call sites`}))};
}

module.exports = {generateControllerExtends};
