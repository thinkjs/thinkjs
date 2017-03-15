import index from '../index.js';

module.exports = class extends index {
  indexAction(){
    let data = Promise.resolve(333);
    this.ctx.body = data;
  }
}