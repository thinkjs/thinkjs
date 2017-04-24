var configTree = {};
var helper = require('think-helper');
var fs = require('fs');
var path = require('path');
/**
 * createConfigFile
 * configPath
 * configTree
 */

module.exports =  function createConfigFile(configPath, templatePath) {

	
	templatePath = path.join(templatePath, 'config');

	function handleDir(configPath) {

		var files = fs.readdirSync(configPath);

		files.forEach(function (filePath){
				let currentSourcePath = path.resolve(configPath, filePath);
				if(helper.isDirectory(currentSourcePath)) {
					configTree[filePath+'.dir'] = {};
				    handleDir(currentSourcePath, configTree[filePath+'.dir']);
				} else {
					let content = fs.readFileSync(currentSourcePath, 'utf8');
					configTree[filePath+'.file'] = content;
				}
		})
	}

	handleDir(templatePath);

	var configFile = path.resolve(configPath, 'think.json');

	fs.writeFileSync(configFile, JSON.stringify(configTree), 'utf8');
}

