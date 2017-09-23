# think-router-rest

Let think-router recognize REST router easily without custom router for ThinkJS 3.x.

## Installation

```sh
npm install think-router-rest --save
```

## How To Use

append this middleware in `src/config/middleware.js`:

```
const router = require('think-router');
const routerREST = require('think-router-rest');

module.exports = [
  {handle: router, options: {}},
  routerREST
];
```

## Contributing

Contributions welcome!

## License

[MIT](https://github.com/thinkjs/think-router-rest/blob/master/LICENSE)


