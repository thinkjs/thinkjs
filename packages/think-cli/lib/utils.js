const fs = require('fs');
const path = require('path');
const exec = require('child_process').execSync;
const fsReaddir = promisify(fs.readdir, fs);
const fsRmdir = promisify(fs.rmdir, fs);
const fsUnlink = promisify(fs.unlink, fs);

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
  /**
   * check path is exist
   *
   * @param  {String} target path
   * @return {Boolean}
   */
  isExist(target) {
    target = path.normalize(target);

    try {
      fs.accessSync(target);
      return true;
    } catch (e) {
      return false;
    }
  },

  /**
   * check path is directory
   * @param {String} path
   * @param {Boolean}
   */
  isDirectory(targetPath) {
    const {isExist} = module.exports;
    if (!isExist(targetPath)) return false;
    return fs.statSync(targetPath).isDirectory();
  },

  /**
   * Remove directory by path
   * @param {String} target path
   */
  rmdir(targetPath) {
    const {isDirectory, rmdir} = module.exports;
    if (!isDirectory(targetPath)) return Promise.resolve();

    return fsReaddir(targetPath)
      .then(files => {
        return files.map(item => {
          const filepath = path.join(targetPath, item);
          if (isDirectory(filepath)) {
            return rmdir(filepath);
          } else {
            return fsUnlink(filepath);
          }
        });
      })
      .then(list => Promise.all(list))
      .then(() => fsRmdir(targetPath));
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
