'use strict';

const fs = require('node:fs');
const {execFileSync} = require('node:child_process');

const run = (file, args) => execFileSync(process.execPath, [require.resolve(file), ...args], {stdio: 'inherit'});
run('think-ts-helper/cli.js', ['generate', '.', '--models', '--configs']);
run('typescript/bin/tsc', ['--noEmit']);
// This fixture owns app/. Do not ship a removed source file's previous output.
fs.rmSync('app', {recursive: true, force: true});
run('typescript/bin/tsc', []);
