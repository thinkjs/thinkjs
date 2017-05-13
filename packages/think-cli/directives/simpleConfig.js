const helper = require('think-helper');
const fs = require('fs');
const path = require('path');
var content = '';

module.exports = function(configPath, name) {
	if(helper.isDirectory(configPath)) {
		let filePath = path.join(configPath, name);
		fs.writeFileSync(filePath, content);
	}
}