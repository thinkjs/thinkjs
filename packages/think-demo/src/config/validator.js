module.exports = {
  rules: {
    _newrule: function(validValue, query) {
      console.log('query-->', query);
      return validValue;
    },
    newrule: function(value, parsedValue) {
      return value === parsedValue;
    }
  },
  messages: {
    newrule: 'this is newrule custom message'
  }
}
