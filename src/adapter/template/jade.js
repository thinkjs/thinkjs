'use strict';

/**
 * jade template
 * @type {Class}
 */
let jade;

module.exports = class extends think.adapter.tempalte {
  async run(templateFile, tVar){
    if (!jade) {
      jade = require('jade');
    }
    let content = await this.getContent(templateFile);
    return jade.compile(content, {
      filename: templateFile
    })(tVar);
  }
}