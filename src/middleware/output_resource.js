'use strict';

import fs from 'fs';
import mime from 'mime';

/**
 * output resource
 * @type {}
 */
export default class extends think.middleware.base {
  /**
   * run
   * @return {} []
   */
  run(file){
    //not resource
    if(file === false){
      return;
    }
    let http = this.http;
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
      return this.outputNormal(file);
    }
    return this.outputRange(file, range);
  }
  /**
   * output normal file
   * @param  {String} file []
   * @return {Promise}      []
   */
  outputNormal(file){
    let http = this.http;
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
  /**
   * output range file
   * @param  {String} file  []
   * @param  {String} range []
   * @return {Promise}       []
   */
  outputRange(file, range){
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

    let http = this.http;
    http.status(206);
    http.header('Accept-Ranges', 'bytes');
    http.header('Content-Range', `bytes ${from}-${to}/${size}`);
    
    let fd = fs.openSync(file, 'r');
    let buffer = new Buffer(to - from + 1);
    fs.readSync(fd, buffer, 0, to - from, from);
    fs.closeSync(fd);
    http.end(buffer);

    return think.prevent();
  }
}