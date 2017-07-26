const fs = require('fs');
const helper = require('think-helper');
const formidable = require('formidable');
const onFinish = require('on-finished');

const fsUnlink = helper.promisify(fs.unlink, fs);
const fsAccess = helper.promisify(fs.access, fs);

module.exports = (ctx, opts = {}) => {
  const req = ctx.req;
  const form = new formidable.IncomingForm(opts);

  let uploadFiles = null;

  onFinish(ctx.res, () => {
    if (!uploadFiles) return;
    Object.keys(uploadFiles).forEach(key => {
      const filepath = uploadFiles[key].path;
      fsAccess(filepath).then(() => fsUnlink(filepath)).catch(() => {});
    });
  });

  return new Promise((resolve, reject) => {
    form.parse(req, function(err, fields, files) {
      if (err) return reject(err);

      uploadFiles = files;
      resolve({
        post: fields,
        file: files
      });
    });
  });
};
