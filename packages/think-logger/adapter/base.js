module.exports = class {
  constructor() {
    this._logger = {};
  }
  
  debug(...args) {
    return this._logger.debug(...args);
  }

  info(...args) {
    return this._logger.info(...args);
  }

  warn(...args) {
    return this._logger.warn(...args);
  }

  error(...args) {
    return this._logger.error(...args);
  }
};