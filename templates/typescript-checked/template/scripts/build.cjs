'use strict';
const path = require('node:path');
const checked = require('./checked.cjs');
const root = path.resolve(__dirname, '..');
const release = checked.lock(root);
process.once('exit', release);
process.once('SIGINT', () => process.exit(130));
process.once('SIGTERM', () => process.exit(143));
try { checked.build(root); } finally { release(); }
