# think-router-rest

[![npm](https://img.shields.io/npm/v/think-router-rest.svg?style=flat-square)]()
[![Travis](https://img.shields.io/travis/thinkjs/think-router-rest.svg?style=flat-square)]()
[![Coveralls](https://img.shields.io/coveralls/thinkjs/think-router-rest/master.svg?style=flat-square)]()
[![David](https://img.shields.io/david/thinkjs/think-router-rest.svg?style=flat-square)]()

Let think-router recognize REST router easily without custom router for ThinkJS 3.x.

## Installation

```sh
npm install think-router-rest --save
```

## How To Use

append this middleware in `src/config/middleware.js`:

```js
const router = require('think-router');
const routerREST = require('think-router-rest');

module.exports = [
  {handle: router, options: {}},
  {handle: routerREST, options: {}}
];
```

## TypeScript and package development

The CommonJS factory is also available to TypeScript consumers:

```ts
import routerREST = require('think-router-rest');

const middleware = routerREST({
  restConstName: '_REST',
  methodConstName: '_method'
});
```

The options object is required, as before; pass `{}` for default constant names.
The returned middleware accepts a structural routing context and preserves the
exact return type of `next`. Controllers can be classes or objects, including
module-indexed registries. Query values remain unvalidated HTTP input: a truthy
method override without a callable `toLowerCase` still throws at runtime. Validate
untrusted input upstream. Missing module registries also retain their legacy
error behavior.

`require('think-router-rest')` and `require('think-router-rest/index.js')` keep the
same function export. The package ships compiled JavaScript, declarations,
JavaScript/declaration maps, and source for map resolution. No compiler or ambient
Node/debug declarations are needed to use the installed package. Generated types
are tested with TypeScript 3.9.10 and 5.9.3; this is not a framework-wide minimum
TypeScript-version decision.

From the monorepo root, after installing dependencies with the pinned pnpm:

```sh
pnpm --filter think-router-rest build
pnpm --filter think-router-rest typecheck
pnpm --filter think-router-rest test
pnpm --filter think-router-rest coverage
pnpm --filter think-router-rest clean
```

`prepack` forces a checked rebuild, including when outputs were deleted but
incremental metadata remains. `clean` only removes currently configured compiler
outputs; it is not a stale-file ownership tracker. The root build foundation
provides the maintainer compiler and lint dependencies.

## Contributing

Contributions welcome!

## License

[MIT](https://github.com/thinkjs/think-router-rest/blob/master/LICENSE)


