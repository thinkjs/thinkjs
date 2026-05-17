module.exports = {
  rules: {
    _newrule: function(validValue, { currentQuery }) {
      console.log('query-->', currentQuery);
      return validValue;
    },
    newrule: function(value, { parsedValidValue }) {
      return value === parsedValidValue;
    }
  },
  messages: {
    newrule: 'this is newrule custom message'
  }
}
