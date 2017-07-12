const path = require('path');
const thinkLogger = require('think-logger3');
const ConsoleLogger = thinkLogger.Console;
const FileLogger = thinkLogger.File;
const DateFileLogger = thinkLogger.DateFile;

/**
 * logger
 */
exports.logger = {
  type: 'console',
  console: {
    handle: ConsoleLogger
  },
  file: {
    handle: FileLogger,
    filename: path.join(think.ROOT_PATH, 'logs/file.log'),
    maxLogSize: 50 * 1024, // 50M
    backups: 10 // max chunk number
  },
  dateFile: {
    handle: DateFileLogger,
    level: 'ALL',
    filename: path.join(think.ROOT_PATH, 'logs/file.log'),
    pattern: '-yyyy-MM-dd',
    alwaysIncludePattern: false
  }
};
