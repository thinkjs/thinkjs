# think-typescript

# think-typescript
[![Build Status](https://travis-ci.org/thinkjs/think-typescript.svg?branch=master)](https://travis-ci.org/thinkjs/think-typescript)
[![Coverage Status](https://coveralls.io/repos/github/thinkjs/think-typescript/badge.svg?branch=master)](https://coveralls.io/github/thinkjs/think-typescript?branch=master)
[![npm](https://img.shields.io/npm/v/think-typescript.svg?style=flat-square)](https://www.npmjs.com/package/think-typescript)

`think-typescript` compile typescript file

## Syntax

```js
import thinkTypescript from 'think-typescript';
thinkTypescript({
  srcPath,
  outPath,
  file,
  typescriptOptions,
  ext,
});

```

- `srcPath`           {String} the file source path.
- `outPath`           {String} the directory for output file.
- `file`              {String} the file path in the 'srcPath'.
- `[typescriptOptions]` {Object} the typescript options,default `{fileName: file, reportDiagnostics: true, compilerOptions: {module: 'commonjs', target: 'es5', sourceMap: true}}`.
- `[ext]`             {String} the new file extension,default `.js`.

## Usage

Compile typescript file:

```js
import thinkTypescript from 'think-typescript';

thinkTypescript({
  srcPath: './test/src/a',
  outPath: './test/out',
  file: 'b/test.ts'
});

```

### Optional emit report

Pass `onEmit(relativeFiles)` in the transpile configuration to receive the JS and
optional source-map filenames after all writes succeed. The callback is
synchronous and paths are relative to `outPath`; no report is sent for a compiler
diagnostic. Existing `true`/Error returns are unchanged. The opt-in
`think-watcher/tracked` integration uses this report for session-owned cleanup.
This does not add semantic type checking or change the transpiler's write policy.
