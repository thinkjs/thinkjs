var fs = require("fs");
var content = fs.readFileSync("page.html", {
	encoding: "utf8"
});
var data = {
	data: content
}
fs.writeFileSync("page.json", JSON.stringify(data));