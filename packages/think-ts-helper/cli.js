#!/usr/bin/env node
'use strict';

const {generate, watch} = require('./index');

function main(args) {
  const command = args.shift();
  if (!['generate', 'check', 'watch'].includes(command)) throw new Error('Usage: think-ts-helper generate|check|watch [root] [--source-dir src] [--out-dir .thinkjs/types] [--models] [--configs] [--controller-extends] [--interval 500 (watch only)]');
  const options = {check: command === 'check'};
  while (args.length) {
    const arg = args.shift();
    if (arg === '--models') options.models = true;
    else if (arg === '--configs') options.configs = true;
    else if (arg === '--controller-extends') options.controllerExtends = true;
    else if (arg === '--interval') {
      const value = args.shift();
      if (command !== 'watch' || !value || !/^\d+$/.test(value)) throw new Error('--interval requires watch and a millisecond integer');
      options.interval = Number(value);
    }
    else if (arg === '--source-dir' || arg === '--out-dir') {
      const value = args.shift();
      if (!value || value.startsWith('--')) throw new Error(`Missing value for ${arg}`);
      options[arg === '--source-dir' ? 'sourceDir' : 'outDir'] = value;
    } else if (arg.startsWith('-') || options.root) throw new Error(`Unknown argument: ${arg}`);
    else options.root = arg;
  }
  if (command === 'watch') {
    const watcher = watch(options);
    const close = () => watcher.close();
    process.on('SIGINT', close);
    process.on('SIGTERM', close);
    watcher.on('close', () => {
      process.removeListener('SIGINT', close);
      process.removeListener('SIGTERM', close);
    });
    watcher.on('diagnostic', diagnostic => {
      if (diagnostic.severity === 'error') process.exitCode = 1;
      const prefix = diagnostic.message.startsWith(diagnostic.code + ':') ? '' : diagnostic.code + ': ';
      process.stderr.write(`${prefix}${diagnostic.message}\n`);
    });
    for (const event of ['ready', 'update']) watcher.on(event, result => {
      process.exitCode = 0;
      process.stdout.write(`${event}: ${result.changed.length ? result.changed.join(', ') : 'up to date'}\n`);
    });
    watcher.ready.catch(() => { process.exitCode = 1; });
    return;
  }
  const result = generate(options);
  for (const diagnostic of result.diagnostics) process.stderr.write(`${diagnostic.code}: ${diagnostic.message}\n`);
  process.stdout.write(`${command}: ${result.changed.length ? result.changed.join(', ') : 'up to date'}\n`);
  if (options.check && result.changed.length) process.exitCode = 1;
}

try { main(process.argv.slice(2)); } catch (error) {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
}
