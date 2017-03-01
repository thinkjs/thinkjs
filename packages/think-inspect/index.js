const Helper = require('think-helper');
const fs = require('fs');

/**
 * check if node version meets the requirement of ThinkJS.
 * @param {Object} config: {THINK_PATH: 'XXX'}.
 * `THINK_PATH` specifies the path of ThinkJS module.
 * @param {Function} callback: callback when error occurs.
 */
function checkNodeVersion(config, callback) {
  let packageFile = `${config.THINK_PATH}/package.json`;
  if(!Helper.isFile(packageFile)){
    return;
  }
  let {engines} = JSON.parse(fs.readFileSync(packageFile, 'utf-8'));
  let needVersion = engines.node.substr(2);

  let nodeVersion = process.version;
  if(nodeVersion[0] === 'v'){
    nodeVersion = nodeVersion.slice(1);
  }
  if(needVersion > nodeVersion){
    callback(`ThinkJS need node version >= ${needVersion}, current version is ${nodeVersion}, please upgrade it.`, 'EXIT');
  }
}
exports.checkNodeVersion = checkNodeVersion;

/**
 * check if filenames in application are in lowercase;
 * include: js, html, tpl;
 * exclude: filenames with `/locale/`.
 * @param {Object} config: {APP_PATH: 'app', sep: '/', locale: 'locale'}.
 * `APP_PATH` specifies the absolute path of application.
 * @param {Function} callback: callback when error occurs.
 * @return {} []
 */
function checkFileName(config, callback) {
  let files = Helper.getdirFiles(config.APP_PATH);
  const excludePath = `${config.sep}${config.locale}${config.sep}`;
  const excludeReg = new RegExp(excludePath);
  const includeReg = /\.(js|html|tpl)$/;
  const uppercaseReg = /[A-Z]/;
  files.forEach((item) => {
    // inspect filename
    if(!includeReg.test(item) || excludeReg.test(item)) return;
    if(uppercaseReg.test(item)) {
      callback(`filename \`${item}\` has uppercase chars.`, 'WARNING');  
    }
  });
}
exports.checkFileName = checkFileName;
 
 /**
  * check dependencies are installed before server starts
  * @param {Object} config: {ROOT_PATH: 'XXX', sep: '/', env: 'development'}.
  * `APP_PATH` specifies the root path of project.
  * @param {Function} callback: callback when error occurs.
  * @return {} []
  */
function checkDependencies(config, callback) {
  let packageFile = `${config.ROOT_PATH}/package.json`;
  if(!Helper.isFile(packageFile)){
    return;
  }

  let data = JSON.parse(fs.readFileSync(packageFile, 'utf-8'));
  let dependencies = Helper.extend({}, data.dependencies);

  // merge devDependencies in development env
  if(config.env === 'development') {
    dependencies = Helper.extend(dependencies, data.devDependencies);
  }

  // package alias
  let pkgAlias = {
    'babel-runtime': 'babel-runtime/helpers/inherits'
  };
  let pkgPath = `${config.ROOT_PATH}${config.sep}node_modules${config.sep}`;
  for(let pkg in dependencies) {
    pkg = pkgAlias[pkg] || pkg;
    if(Helper.isDirectory(`${pkgPath}${pkg}`)) {
      continue;
    }
  
    try {
      require(pkg);
    } catch(e) {
      callback(`package \`${pkg}\` is not installed. please run \`npm install\` command before server starts.`, 'EXIT');
    }
  }
}
exports.checkDependencies = checkDependencies;