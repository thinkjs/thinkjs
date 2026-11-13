#!/usr/bin/env node
'use strict';

const {generate} = require('./index');

function main(args) {
  const command = args.shift();
  if (!['generate', 'check'].includes(command)) throw new Error('Usage: think-ts-helper generate|check [root] [--source-dir src] [--out-dir .thinkjs/types]');
  const options = {check: command === 'check'};
  while (args.length) {
    const arg = args.shift();
    if (arg === '--source-dir' || arg === '--out-dir') {
      const value = args.shift();
      if (!value || value.startsWith('--')) throw new Error(`Missing value for ${arg}`);
      options[arg === '--source-dir' ? 'sourceDir' : 'outDir'] = value;
    } else if (arg.startsWith('-') || options.root) throw new Error(`Unknown argument: ${arg}`);
    else options.root = arg;
  }
  const result = generate(options);
  process.stdout.write(`${command}: ${result.changed.length ? result.changed.join(', ') : 'up to date'}\n`);
  if (options.check && result.changed.length) process.exitCode = 1;
}

try { main(process.argv.slice(2)); } catch (error) {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
}
