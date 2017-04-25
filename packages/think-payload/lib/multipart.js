const fs = require('fs');
const os = require('os');
const path = require('path');
const helper = require('think-helper');
const Busboy = require('busboy');

const uploadDir = `${os.tmpdir()}${path.sep}thinkjs${path.sep}upload`;

exports.before = (ctx) => {
  const req = ctx.req;
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
    });

    req.pipe(busboy);
  });

  return multipart;
};

exports.after = () => {
  return helper.rmdir(uploadDir);
};