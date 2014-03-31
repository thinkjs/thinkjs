var fs = require("fs");
var startTime = Date.now();
var buffer = fs.readFileSync("page.json")
//var str = buffer.toString("utf8");
//var data = JSON.parse(content);
var endTime = Date.now();
console.log(endTime - startTime)