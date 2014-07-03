module.exports = Controller({
  testAction: function(){
    return 'test:test'
  },
  otherAction: function(name, value){
    return JSON.stringify({name: name, value: value})
  }
})