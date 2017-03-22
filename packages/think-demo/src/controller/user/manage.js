
const index = require('../index.js');

module.exports = class extends index {
  indexAction(){

    let data = Promise.resolve(666 + ':' + process.env.THINK_PROCESS_ID);
    this.ctx.body = data;
    setTimeout(() => {
      xxx();
    }, 1000)
  }
}