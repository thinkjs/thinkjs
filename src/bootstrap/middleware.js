'use strict';

import fs from 'fs';
import mime from 'mime';

import './_payload.js';


/**
 * output file
 * @param  {Object} http    []
 * @param  {String} file [file path]
 * @return {}         []
 */
think.middleware('output_resource', (http, file) => {
  //not resource
  if(file === false){
    return;
  }
  //is resource but not exist
  if(file === true){
    http.status(404);
    http.end();
    return think.prevent();
  }
  //flag request is resource
  http._isResource = true;

  let contentType = mime.lookup(file);
  http.type(contentType, false);

  let range = http.header('range');
  if(!range){
    let stream = fs.createReadStream(file);
    stream.pipe(http.res);
    stream.on('end', () => {
      http.end();
    });
    stream.on('error', () => {
      http.end();
    });
    return think.prevent();
  }

  //request has range header
  let size = fs.statSync(file).size;
  let match = range.match(/bytes=(\d+)\-(\d*)/);
  let slice = 1 * 1024 * 1024;
  let from = parseInt(match[1]) || 0;
  let to = parseInt(match[2]) || 0;
  if(!to){
    to = from + slice - 1;
  }
  to = Math.min(to, size - 1);

  http.status(206);
  http.header('Accept-Ranges', 'bytes');
  http.header('Content-Range', `bytes ${from}-${to}/${size}`);
  
  let fd = fs.openSync(file, 'r');
  let buffer = new Buffer(to - from + 1);
  fs.readSync(fd, buffer, 0, to - from, from);
  fs.closeSync(fd);
  http.end(buffer);

  return think.prevent();
});