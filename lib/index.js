const helper = require('think-helper');

const path = require('path');
const thinkInit = require('./core/think.js');


/**
 * applition class
 */
module.exports = class Application {
  constructor(options = {}){
    this.options = options;
    thinkInit(options);
  }
}