const fs = require('fs');
const helper = require('think-helper');
const formidable = require('formidable');
const fs_unlink = helper.promisify(fs.unlink, fs);
const fs_access = helper.promisify(fs.access, fs);

module.exports = (ctx) => {
  const req = ctx.req;
  const form = new formidable.IncomingForm();

  ctx.res.once('finish', () => {
    const files = ctx.request.body.file;
    const unlinks = Object.keys(files).map(key => {
      return fs_access(files[key].path).then(() => fs_unlink(files[key].path)).catch(() => {});
    });
    Promise.all(unlinks);
  });

  return new Promise((resolve, reject) => {
    form.parse(req, function(err, fields, files) {
      if (err) return reject(err);

      resolve({
        post: fields,
        file: files
      });
    });
  });
};