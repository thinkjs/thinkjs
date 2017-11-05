const Base = require('<%= actionPrefix %>base.js');

module.exports = class extends Base {
  indexAction() {
    return this.display();
  }
};
