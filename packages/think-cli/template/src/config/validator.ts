module.exports = {
  rules: {
    newrule: function(value, validValue) {
      return value === validValue;
    }
  },
  messages: {
    newrule: 'this is newrule custom message'
  }
}
