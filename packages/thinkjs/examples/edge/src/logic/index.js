module.exports = class extends think.Logic {
  echoAction() {
    this.rules = {
      name: {required: true, method: 'GET'}
    };
  }
};
