var helper = require('think-helper');
var fs = require('fs');
var path = require('path');

var content = '';
module.exports = function(configPath, name) {

	if(helper.isDirectory(configPath)) {
		let filePath =  path.join(configPath, name);
		fs.writeFileSync(filePath, content);
	}
	
}