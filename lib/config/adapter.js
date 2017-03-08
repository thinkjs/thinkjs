const path = require('path');
const thinkLogger = require('think-logger');
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
    handle: FileLogger
  },
  datefile: {
    handle: DateFile
  }
}