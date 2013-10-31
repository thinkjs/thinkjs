var net = require("net");
var util = require("util");
var client = net.connect({
    port: 11211
}, function(){
    console.log("connected");
    client.write("get welefen");
});
client.on("data", function(data){
    console.log(data);
})
