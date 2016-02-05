var upyun = require("../lib/index.js");
var instance = new upyun("ueapp", "welefen", "xxx");
instance.readdir('/').then(function(data){
  console.log(data);
}).catch(function(err){
  console.log(err.stack);
})