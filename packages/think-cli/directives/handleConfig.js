var configTree = {};
var helper = require('think-helper');
/**
 * createConfigFile
 * configPath
 * configTree
 */

module.exports =  function createConfigFile(configPath) {

	if(!helper.isDirectory(configPath)) {
		errlog('can not find config folder');
	} else {
		createConfigFile(configPath, configTree);
	}

	function handleDir(configPath) {

		var files = fs.readdirSync(configPath);

		files.forEach(function (filePath){
			if(!excludeFile.test(filePath)) {
				let currentSourcePath = path.resolve(configPath, filePath);
				if(helper.isDirectory(currentSourcePath)) {
					configTree[filePath+'.dir'] = {};
				    handleDir(currentSourcePath, configTree[filePath+'.dir']);
				} else {
					let content = fs.readFileSync(currentSourcePath, 'utf8');
					configTree[filePath+'.file'] = content;
				}
			}
		})
	}

	handleDir(configPath);
	var configFile = path.resolve(projectRootPath, 'configTree.js');
	fs.writeFileSync(configFile, JSON.stringify(configTree), 'utf8');
}

