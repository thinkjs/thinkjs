var handleConfig = require("./handleConfig");
var simpleConfig = require("./simpleConfig");
var path = require('path');

module.exports = function(mode, name, projectRootPath, templatePath) {
	let configPath = '';
	switch(mode) {
		case 'config':
		handleConfig(projectRootPath, templatePath);
		break;
		case 'service':
		configPath = path.resolve(projectRootPath, 'service');
		simpleConfig(configPath, name);
		break;
		case 'extend':
		configPath = path.resolve(projectRootPath, 'extend');
		simpleConfig(configPath, name);
		break;
		case 'logic':
		configPath = path.resolve(projectRootPath, 'logic');
		simpleConfig(configPath, name);
		break;
		case 'model':
		configPath = path.resolve(projectRootPath, 'model');    
		simpleConfig(configPath, name);
		break;
		case 'adapter':
		configPath = path.resolve(projectRootPath, 'adapter');    
		simpleConfig(configPath, name);
		break;
	}
}