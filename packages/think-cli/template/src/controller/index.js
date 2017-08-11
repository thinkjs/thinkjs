const Base = require('{path}base.js');

module.exports = class extends Base {
  indexAction() {
    return this.display();
  }
};
