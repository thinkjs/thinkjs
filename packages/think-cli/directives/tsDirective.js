var fs = require('fs');

module.exports = function(currentSourcePath, targetSourcePath) {
	let content = fs.readFileSync(currentSourcePath, 'utf8');
	content = content.replace("think-babel", "think-ts");
	fs.writeFileSync(targetSourcePath, content);
}