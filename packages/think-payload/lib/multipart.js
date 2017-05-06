const fs = require('fs');
const os = require('os');
const path = require('path');
const helper = require('think-helper');
const Busboy = require('busboy');
const fs_unlink = helper.promisify(fs.unlink, fs);
const FILE_PATH = Symbol('filepath');

exports.before = ctx => {
  const req = ctx.req;
  const uploadDir = `${os.tmpdir()}${path.sep}thinkjs${path.sep}upload`;
  helper.mkdir(uploadDir);

  const multipart = new Promise((resolve, reject) => {
    const busboy = new Busboy({ headers: req.headers });
    busboy.on('file', (fieldname, file, filename) => {
      const filepath = `${uploadDir}${path.sep}${helper.uuid()}${path.extname(filename)}`;
      const stream = fs.createWriteStream(filepath);

      stream.on('finish', () => {
        resolve({
          fieldName: fieldname,
          originalFilename: filename,
          path: filepath,
          size: stream.bytesWritten
        });
      });
      stream.on('error', reject);
      file.pipe(stream);

      ctx.state[FILE_PATH] = filepath;
    });

    req.pipe(busboy);
  });

  return multipart;
};

exports.after = ctx => {
  return fs_unlink(ctx.state[FILE_PATH]);
};