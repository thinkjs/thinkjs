var helper = require('think-helper');
var commander  = require('commander');
var fs = require('fs');
var path = require('path');
const colors = require('colors/safe');
const cwd = process.cwd();
//var templatePath = path.dirname(__dirname) + sep + 'template';
var projectRootPath = cwd; //project root path
const excludeFile = /^\./;
var configTree = {};
const configTreeReg = /[^\.]+\.[^\.]+/;
const fs_readdir = helper.promisify(fs.readdir, fs);
const excludeDir = [];

function errlog(msg) {
	console.log(colors.red.underline(msg));
}
/**
 * source
 * target
 */
function copyProject(source, target) {
	helper.mkdir(projectRootPath);
	copyDir(source, target);
	console.log(colors.green('project create succeed'));
}
/**
 * source
 * target
 */
function copyFile(source, target) {
	let content = fs.readFileSync(source, 'utf8');
	fs.writeFileSync(target, content);
}

/**
 * source
 * target
 */
function copyDir(source, target) {
	fs.readdir(source, function(err, files) {
		if(err) {
			errlog(err);
		}
		files.forEach((filePath)=>{
			let currentSourcePath = path.resolve(source, filePath);
			let targetSourcePath = path.resolve(target, filePath);

			if(!excludeFile.test(filePath)) {
				let index =  excludeDir.indexof(filePath);
				if(index === -1) {
					if(helper.isDirectory(currentSourcePath)) {
						helper.mkdir(targetSourcePath);
						return copyDir(currentSourcePath, targetSourcePath);
					} else {
						return copyFile(currentSourcePath, targetSourcePath);
					}
				} else {
					let path = excludeDir[index].toLowerCase()
					privateFunc[path](currentSourcePath, targetSourcePath);
				}
			}
		})	
	})
}
/**
 * projectPath
 */
function createProject(projectPath) {
	if(helper.isDirectory(projectRootPath)) {
		errlog(projectPath+" is already exist in current path")
		return;
	}
	copyProject('think-cli/template', projectRootPath);
}

/**
 * configPath
 * configTree
 */

function createConfigFile(configPath, treeBranch) {

	function handleDir(configPath, treeBranch) {

		var files = fs.readdirSync(configPath);

		files.forEach(function (filePath){
			if(!excludeFile.test(filePath)) {
				let currentSourcePath = path.resolve(configPath, filePath);
				if(helper.isDirectory(currentSourcePath)) {
					treeBranch[filePath+".dir"] = {};
				    handleDir(currentSourcePath, treeBranch[filePath+".dir"]);
				} else {
					let content = fs.readFileSync(currentSourcePath, 'utf8');
					treeBranch[filePath+".file"] = content;
				}
			}
		})
	}

	handleDir(configPath, treeBranch);
	var configFile = path.resolve(projectRootPath, 'configTree.js');
	fs.writeFileSync(configFile, JSON.stringify(configTree), 'utf8');

}
/**
 * privateFunc use in clie
 */
var privateFunc = {
	createconfig: function(currentSourcePath, targetSourcePath) {
		 var configFilePath = path.resolve(cwd, "configTree.js");
		 fs.readFile(configFilePath, function(err, data) {
		 	if(err) {
		 		errlog(err)
		 	}
		 	var configTree = JSON.parse(data);

		 	function handleConfig(currentSourcePath, targetSourcePath, config) {
		 		helper.mkdir(targetSourcePath);
		 		for(var i in config) {
		 			var source = path.resolve(currentSourcePath, fileName);
			 		var target = path.resolve(targetSourcePath, fileName);
			 		if(helper.isString(config[i])) {
			 			var fileName = i.match(configTreeReg)[0];;
			 			fs.writeFileSync(target, config[i], 'utf8');
			 		} else {
			 			handleConfig(source, target, config[i]);
			 		}
			 	}
		 	}

		 	handleConfig(currentSourcePath, targetSourcePath, configTree);
		 })
	}
}
/**
 * get version
 * @return {String} []
 */
let getVersion = () => {
  let filepath = path.resolve(__dirname, './package.json');
  let version = JSON.parse(fs.readFileSync(filepath)).version;
  return version;
};
/**
 * display thinkjs version
 * @return {} []
 */
var displayVersion = () => {
  let version = getVersion();
  let chars = [
    ' _______ _     _       _        _  _____ ',
    '|__   __| |   (_)     | |      | |/ ____|',
    '   | |  | |__  _ _ __ | | __   | | (___  ',
    '   | |  | \'_ \\| | \'_ \\| |/ /   | |\\___ \\ ',
    '   | |  | | | | | | | |   < |__| |____) |',
    '   |_|  |_| |_|_|_| |_|_|\\_\\____/|_____/ ',
    '                                         '                                       
  ].join('\n');
  console.log('\n v' + version + '\n');
  console.log(chars);
};

commander.option('-v, --version', 'output the version number', () => {
  displayVersion();
});

commander.option('-V', 'output the version number', () => {
  displayVersion();
});

commander.command('new <projectPath> <config>').description('create project').action((projectPath, configPath) => {
	projectRootPath = path.resolve(projectRootPath, projectPath);
	if(configPath) {
		excludeDir.push("config");
	}
	createProject(projectPath);
});

commander.command('create config').action(() => {
	var configPath = path.resolve(projectRootPath, 'config');

	if(!helper.isDirectory(configPath)) {
		errlog("can not find config folder")
	} else {
		createConfigFile(configPath, configTree);
	}
});

commander.option('creat-config', 'output the version number', () => {

});

commander.parse(process.argv);;
