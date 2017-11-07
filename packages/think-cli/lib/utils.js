const fs = require('fs');
const path = require('path');
const exec = require('child_process').execSync;
const helper = require('think-helper');
const logger = require('./logger');

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
    logger.success('create ' + path.relative(process.cwd(), dir));
  },

  copyFile(source, target) {
    // if source file is not exist
    if (!helper.isFile(source)) return;
    if (!helper.isExist(path.dirname(target))) {
      helper.mkdir(path.dirname(target));
    }

    const content = fs.readFileSync(source, 'utf8');
    fs.writeFileSync(target, content);
    return target;
  },

  /**
   * When creating a very deep file, this method can return the prefix
   * Example:
   *   const prefix = getPrefix('user/user2/user3/user4.js')
   *   console.log(prefix) => '../../../'
   *
   * @param  {string} name - 文件名
   * @return {string} prefix - 路径前缀
   */
  getPrefix(name) {
    return name.replace(/^\//, '').includes('/') ? '../'.repeat(name.match(/\//g).length) : './';
  },

  getActionName(name) {
    return name.replace(/\.(js)$/, '');
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

  compose(...funcs) {
    const first = funcs.pop();
    return (...args) => funcs.reverse().reduce((item, fn) => fn(item), first(...args));
  }
};
