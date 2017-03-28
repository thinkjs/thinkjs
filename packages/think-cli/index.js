var helper = require('think-helper');
var commander  = require('commander');
var fs = require('fs');
var path = require('path');
var colors = require('colors/safe');
var cwd = process.cwd();
//var templatePath = path.dirname(__dirname) + sep + 'template';
var projectRootPath = cwd; //project root path
var configTree = {};
const excludeFile = /^\./;
const configTreeFile = /.file$/;
const configTreeDir = /.dir$/
//const fs_readdir = helper.promisify(fs.readdir, fs);
var excludeDir = [];

function errlog(msg) {
	console.log(colors.red.underline(msg));
}
/**
 * copyProject
 * source
 * target
 */
function copyProject(source, target) {
	helper.mkdir(projectRootPath);
	copyDir(source, target);
	console.log(colors.green('project create succeed'));
}
/**
 * copyFile
 * source
 * target
 */
function copyFile(source, target) {
	let content = fs.readFileSync(source, 'utf8');
	fs.writeFileSync(target, content);
}

/**
 * copyDir
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
				let index =  excludeDir.indexOf(filePath);
				if(index === -1) {
					if(helper.isDirectory(currentSourcePath)) {
						helper.mkdir(targetSourcePath);
						return copyDir(currentSourcePath, targetSourcePath);
					} else {
						return copyFile(currentSourcePath, targetSourcePath);
					}
				} else {
					let path = excludeDir[index].toLowerCase()
					privateFunc['create'+path](currentSourcePath, targetSourcePath);
				}
			}
		})	
	})
}
/**
 * createProject
 * projectPath
 */
function createProject(projectPath) {
	if(helper.isDirectory(projectRootPath)) {
		errlog(projectPath +' is already exist in current path');
		return;
	}
	copyProject(path.resolve(__dirname, 'template'), projectRootPath);
}

/**
 * createConfigFile
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
					treeBranch[filePath+'.dir'] = {};
				    handleDir(currentSourcePath, treeBranch[filePath+'.dir']);
				} else {
					let content = fs.readFileSync(currentSourcePath, 'utf8');
					treeBranch[filePath+'.file'] = content;
				}
			}
		})
	}

	handleDir(configPath, treeBranch);
	var configFile = path.resolve(projectRootPath, 'configTree.js');
	fs.writeFileSync(configFile, JSON.stringify(configTree), 'utf8');

}
/**
 * privateFunc use in cli
 */
var privateFunc = {
	createconfig: function(currentSourcePath, targetSourcePath) {
		 var configFilePath = path.resolve(cwd, 'configTree.js');
		 fs.readFile(configFilePath, function(err, data) {
		 	if(err) {
		 		errlog(err)
		 	}
		 	var configTree = JSON.parse(data);

		 	function handleConfig(currentSourcePath, targetSourcePath, config) {
		 		
		 		targetSourcePath = targetSourcePath.replace(configTreeDir, '')
		 		helper.mkdir(targetSourcePath);
		 		
		 		for(var i in config) {
		 			let fileName = i.replace(configTreeFile, '');
		 			var source = path.resolve(currentSourcePath, fileName);
			 		var target = path.resolve(targetSourcePath, fileName);
			 		if(helper.isString(config[i])) {
			 			//var fileName = i.match(configTreeReg)[0];
			 			fs.writeFileSync(target, config[i], 'utf8');
			 		} else {
			 			handleConfig(source, target, config[i]);
			 		}
			 	}
		 	}
		 	handleConfig(currentSourcePath, targetSourcePath, configTree);
		 })
	},
	handleConfig: function() {

		// var configArr = config.split('-');

		// configArr.forEach((item)=>{
		// 	switch(item) {
		// 		case '-c':
		// 		excludeDir.push('config');
		// 		break;
		// 	}
		// })	
		excludeDir.push('config');
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


commander.command('new <projectPath> [config]').description('create project').action((projectPath, config) => {
	projectRootPath = path.resolve(projectRootPath, projectPath);
	if(config) {
		privateFunc.handleConfig();
	}
	
	createProject(projectPath);
});

commander.command('create <mode>')
		 .description('create config file')
		 .action((mode) => {
		 	if(mode === 'config') {
		 		var configPath = path.resolve(projectRootPath, 'config');
		 		
				if(!helper.isDirectory(configPath)) {
					errlog('can not find config folder');
				} else {
					createConfigFile(configPath, configTree);
				}
		 	}
		});


// commander.option('creat-config', 'output the version number', () => {

// });

commander.parse(process.argv);;
