const fs = require('fs');
const path = require('path');
const exec = require('child_process').execSync;
const helper = require('think-helper');
const logger = require('./logger');

/**
 * make callback function to promise
 * @param  {Function} fn
 * @param  {Object}   receiver
 * @return {Promise}
 */
function promisify(fn, receiver) {
  return (...args) => {
    return new Promise((resolve, reject) => {
      fn.apply(receiver, [...args, (err, res) => {
        return err ? reject(err) : resolve(res);
      }]);
    });
  };
}

module.exports = {
  isLocalPath(templatePath) {
    return /^[./]|(^[a-zA-Z]:)/.test(templatePath);
  },

  getLocalTemplatePath(templatePath) {
    return path.isAbsolute(templatePath)
      ? templatePath
      : path.normalize(path.join(process.cwd(), templatePath));
  },

  isThinkApp(root) {
    if (!helper.isDirectory(root)) return false;
    const filepath = path.join(root, 'package.json');
    if (!helper.isFile(filepath)) return false;
    const packageJSON = require(filepath);
    return !!packageJSON.dependencies.thinkjs;
  },

  mkdir(dir) {
    if (helper.isDirectory(dir)) return;
    helper.mkdir(dir);
    logger.success('create ' + path.relative(this.cwd, dir));
  },

  copyFile(source, target) {
    // if source file is not exist
    if (!helper.isFile(source)) return;

    const content = fs.readFileSync(source, 'utf8');
    fs.writeFileSync(target, content);
    return target;
  },

  getGitUser() {
    let name, email;

    try {
      name = exec('git config --get user.name');
      email = exec('git config --get user.email');
    } catch (e) {}

    name = name && name.toString().trim();
    email = email && (' <' + email.toString().trim() + '>');
    return (name || '') + (email || '');
  },

  promisify
};
