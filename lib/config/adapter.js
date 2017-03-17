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
  },
  dateFile: {
    handle: DateFileLogger
  }
}