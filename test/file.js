var fs = require("fs");
var filePath = "files/";
fs.mkdirSync(filePath)
for(var i=0;i<100000;i++){
	var file = filePath + Date.now() + ".json";
	fs.writeFileSync(file, JSON.stringify({"time": Date.now()}));
}