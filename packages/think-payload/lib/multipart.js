const fs = require('fs');
const helper = require('think-helper');
const formidable = require('formidable');
const fs_unlink = helper.promisify(fs.unlink, fs);

exports.before = ctx => {
  const req = ctx.req;
  const form = new formidable.IncomingForm();

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

exports.after = ctx => {
  const files = ctx.request.body.file;
  const unlinks = Object.keys(files).map(key => {
    return fs_unlink(files[key].path);
  });

  return Promise.all(unlinks);
};