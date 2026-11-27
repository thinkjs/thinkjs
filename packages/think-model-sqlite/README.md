# think-model-sqlite

[![npm](https://img.shields.io/npm/v/think-model-sqlite.svg?style=flat-square)]()
[![Travis](https://img.shields.io/travis/thinkjs/think-model-sqlite.svg?style=flat-square)]()
[![Coveralls](https://img.shields.io/coveralls/thinkjs/think-model-sqlite/master.svg?style=flat-square)]()
[![David](https://img.shields.io/david/thinkjs/think-model-sqlite.svg?style=flat-square)]()


SQLite adapter for think model

## Node.js requirements

Version 3 uses Node.js's built-in `node:sqlite` and no longer installs
`better-sqlite3` or requires the `--experimental-sqlite` flag.

- Node.js 24: **24.15.0 or later** within the 24.x line.
- Node.js 25: **25.7.0 or later** within the 25.x line (compatibility only; Node.js 25 is end-of-life).
- Node.js 26 and later are also supported.

The minimum versions use the release-candidate API. See the Node.js
[24.15.0 release notes](https://nodejs.org/en/blog/release/v24.15.0) and
[25.7.0 release notes](https://nodejs.org/en/blog/release/v25.7.0).

On older Node versions, stay on `think-model-sqlite@2`. The CommonJS entry,
adapter configuration (including `path: true` / `':memory:'`) and on-disk
database path are unchanged. Existing SQLite files can be opened directly
without importing or migrating them.
