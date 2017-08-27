# think-logger

[![npm](https://img.shields.io/npm/v/think-logger3.svg?style=flat-square)]()
[![Travis](https://img.shields.io/travis/thinkjs/think-logger.svg?style=flat-square)]()
[![Coveralls](https://img.shields.io/coveralls/thinkjs/think-logger/master.svg?style=flat-square)]()
[![David](https://img.shields.io/david/thinkjs/think-logger.svg?style=flat-square)]()

ThinkJS3.x log module, based on log4js.

## Installation

    npm install think-logger3


## How To Use


### Basic 

  ```js
 const Logger = require('think-logger3');
 let logger = new Logger();
 logger.debug('Hello World');
  ```


There has four log function you can use:

 ```js
logger.info('info log');
logger.debug('debug log');
logger.warn('warn log');
logger.error('error log');
 ```

### Advanced

If you want to log file, you can use file adapter like this:

```js
const Logger = require('think-logger3');
let logger = new Logger({
   handle: Logger.File,
   filename: __dirname + '/test.log'
});
logger.debug('Hello World');
```

## Adapters

### File

This adapter will log to a file, and supports split log file by a constant file size. For example:

```js
const Logger = require('think-logger3');
let logger = new Logger({
  handle: Logger.File,
  filename: __dirname + '/debug.log',
  maxLogSize: 50 * 1024,  //50M
  backups: 10 //max chunk number
})
```

Then initial log would create a file called `debug.log`. After this file reached `maxLogSize`, a new file named `debug.log.1` will be created. After log file number reached `backups`, old log chunk file will be removed.

#### Configuration

- `filename`: log filename
- `maxLogSize`: The maximum size (in bytes) for a log file, if not provided then logs won't be rotated.
- `backups`: The number of log files to keep after logSize has been reached (default 5)
- `absolute`: If `filename` is a absolute path, the `absolute` value should be `true`.
- `layout`: Layout defines the way how a log record is rendered. More layouts can see [here](https://github.com/nomiddlename/log4js-node/wiki/Layouts).

### DateFile

This adapter will log to a file, moving old log messages to timestamped files according to a specified pattern. For example:

```js
const Logger = require('think-logger3');
let logger = new Logger({
  handle: Logger.DateFile,
  filename: __dirname + '/debug.log',
  pattern: '-yyyy-MM-dd',
  alwaysIncludePattern: false
});
```

Then initial log would create a file called `debug.log`. At midnight, the current `debug.log` file would be rename to `debug.log-2017-03-12`(for example), and a new `debug.log` file created.

#### Configuration

- `level`: log level
- `filename`: log base filename
- `pattern`: date filename would append to filename. A new file is started whenever the pattern for the current log entry differs from that of the previous log entry. The following strings are recognised in the pattern:
  - yyyy - the full year, use yy for just the last two digits
  - MM - the month
  - dd - the day of the month
  - hh - the hour of the day (24-hour clock)
  - mm - the minute of the hour
  - ss - seconds
  - SSS - milliseconds (although I'm not sure you'd want to roll your logs every millisecond)
  - O - timezone (capital letter o)
- `alwaysIncludePattern`: If `alwaysIncludePattern` is true, then the initial file will be `filename.2017-03-12` and no renaming will occur at midnight, but a new file will be written to with the name `filename.2017-03-13`.
- `absolute`: If `filename` is a absolute path, the `absolute` value should be `true`.
- `layout`: Layout defines the way how a log record is rendered. More layouts can see [here](https://github.com/nomiddlename/log4js-node/wiki/Layouts).

### Tips:

`think-logger3` will auto detect cluster mode by `cluster.workers`, you needn't configure for cluster handly. If you want instance logger before fork worker, you can use like `new Logger({handle: Logger.File}, true)`.


## Contributing

Contributions welcome!

## License

[MIT](https://github.com/thinkjs/think-logger/blob/master/LICENSE)
