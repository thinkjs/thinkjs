const handleConfig = require("./handleConfig");
const simpleConfig = require("./simpleConfig");
const path = require('path');
const fs = require('fs');

module.exports = function(mode, name, projectRootPath, templatePath) {
	let configPath = '';
	switch(mode) {
		case 'config':
		handleConfig(projectRootPath, templatePath);
		break;
		case 'service':
		configPath = path.join(projectRootPath, 'src/service');
		simpleConfig(configPath, name);
		break;
		case 'logic':
		configPath = path.resolve(projectRootPath, 'src/logic');
		simpleConfig(configPath, name);
		break;
		case 'model':
		configPath = path.resolve(projectRootPath, 'src/model');
		break;
	}
}