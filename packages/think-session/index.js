const Session = require('./lib/session.js');

module.exports = {
  context: {
    session: function(name, value, options) {
      const instance = new Session(this, options);
      return instance.run(name, value);
    }
  },
  controller: {
    session: function(name, value, options) {
      const instance = new Session(this.ctx, options);
      return instance.run(name, value);
    }
  }
};
