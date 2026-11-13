# think-watcher
[![Build Status](https://travis-ci.org/thinkjs/think-watcher.svg?branch=master)](https://travis-ci.org/thinkjs/think-watcher)
[![Coverage Status](https://coveralls.io/repos/github/thinkjs/think-watcher/badge.svg?branch=master)](https://coveralls.io/github/thinkjs/think-watcher?branch=master)
[![npm](https://img.shields.io/npm/v/think-watcher.svg?style=flat-square)](https://www.npmjs.com/package/think-watcher)

watch file changed

## Opt-in tracked output cleanup

`require('think-watcher/tracked')` preserves the synchronous constructor shape
while tracking only outputs explicitly reported by the compiler. Change
callbacks receive `{path, file, event: 'change', onEmit}`; call
`onEmit(['service/example.js', 'service/example.js.map'])` after a successful
emit. Deletions remove only unchanged, session-owned files before delivering
`{path, file, event: 'unlink'}`. The legacy default entry is unchanged.

With ThinkJS, use `watcher: require('think-watcher/tracked')` and the updated
`think-typescript` transpiler. `watcherOptions` accepts `interval` and `onError`;
Application supplies its source/output paths and skips transpilation on unlink.
Close `application.watcherInstance` as part of your shutdown handling.

Start with an intentionally clean build directory. This ledger protects deletion,
not transpiler writes, and does not survive process restart. Unknown pre-existing
output is preserved. Sources/outputs must be distinct non-symlink directories.
Callbacks are synchronous; Promise callbacks are rejected. See the
[scope, ownership and lifecycle notes](../../docs/typescript-migration/p1-runtime-watch.md)
before enabling this prototype.
