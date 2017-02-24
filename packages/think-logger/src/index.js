const assert = require('assert');

class Logger {
  constructor({handle, ...config}) {
    if( !this instanceof Logger ) {
      return new Logger({handle, ...config});
    }
    
    this._logger = new handle(config);
    ['debug', 'info', 'warn', 'error'].forEach(level => {
      assert(this._logger[level], `adapter function ${level} not exist!`);
      this[level] = (...args) => {
        this._beforeLog(...args);
        this._logger[level](...args);
        this._afterLog(...args);
      }
    });
  }

  _beforeLog() {

  }

  _afterLog() {

  }
}

module.exports = Logger;