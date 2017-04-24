const fs = require('fs');
const os = require('os');
const path = require('path');
const helper = require('think-helper');
const Busboy = require('busboy');

module.exports = (ctx, opts = {}) => {
  const req = ctx.req;
  const uploadDir = `${os.tmpdir()}${path.sep}thinkjs${path.sep}upload`;
  helper.mkdir(uploadDir);

  const multipart = new Promise((resolve, reject) => {
    const busboy = new Busboy({ headers: req.headers });
    let fileData = {};

    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
      const filepath = `${uploadDir}${path.sep}${helper.uuid()}${path.extname(filename)}`;
      const stream = fs.createWriteStream(filepath);
      const receivedBuffers = [];
      let receivedBuffersLength = 0;

      file.pipe(stream);

      stream.on('data', (chunk) => {
        receivedBuffers.push(chunk);
        receivedBuffersLength += chunk.length;
      });

      stream.on('finish', () => {
        resolve({
          fieldName: fieldname,
          originalFilename: filename,
          path: filepath,
          size: Buffer.byteLength(Buffer.concat(receivedBuffers, receivedBuffersLength))
        });
      });

      stream.on('error', reject);
    });

    req.pipe(busboy);
  });

  return multipart;
};