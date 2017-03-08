# think-logger

[![npm](https://img.shields.io/npm/v/think-logger3.svg?style=flat-square)]()
[![Travis](https://img.shields.io/travis/thinkjs/think-logger3.svg?style=flat-square)]()
[![Coveralls](https://img.shields.io/coveralls/thinkjs/think-logger3.svg?style=flat-square)]()
[![David](https://img.shields.io/david/strongloop/think-logger3.svg?style=flat-square)]()

ThinkJS3.x log module

## Installation

    npm install think-logger3


## How To Use

  ```js
 const Logger = require('think-logger');
 let logger = new Logger();
 logger.debug('Hello World');
  ```
    

## Advanced

If you want to log file, you can use file adapter like this:

```js
const Logger = require('think-logger');
let logger = new Logger({
   handle: Logger.File,
   filename: __dirname + '/test.log'
});
logger.debug('Hello World');
```


There has four log function you can use:

 ```js
logger.info('info log');
logger.debug('debug log');
logger.warn('warn log');
logger.error('error log');
 ```

## Other Adapters





