var b = require("./b");
global.fn = 'welefen';
console.log(b.value());
b.change(10);
console.log(b.value());
var c = require("/Users/welefen/Develop/git/thinkjs/test/b");
console.log(b.value());
c.change(20);
console.log(b.value())