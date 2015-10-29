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

  let contentType = mime.lookup(file);
  http.header('Content-Type', `${contentType}; charset=${http.config('encoding')}`);

  let stream = fs.createReadStream(file);
  stream.pipe(http.res);
  stream.on('end', () => {
    http.end();
  });
  stream.on('error', () => {
    http.end();
  });
  return think.prevent();
});


/**
 * rewrite pathname, remove prefix & suffix
 * @param  {Object} http
 * @return {}         []
 */
think.middleware('rewrite_pathname', http => {
  let pathname = http.pathname;
  if (!pathname) {
    return;
  }
  let prefix = http.config('pathname_prefix');
  if (prefix && pathname.indexOf(prefix) === 0) {
    pathname = pathname.substr(prefix.length);
  }
  let suffix = http.config('pathname_suffix');
  if (suffix && pathname.substr(0 - suffix.length) === suffix) {
    pathname = pathname.substr(0, pathname.length - suffix.length);
  }
  http.pathname = pathname;
});


/**
 * sub domain deploy
 * @param  {Object} http){}
 * @return {}
 */
think.middleware('subdomain_deploy', http => {
  let subdomain = http.config('subdomain');
  if (think.isEmpty(subdomain)) {
    return;
  }
  let hostname = http.hostname.split('.')[0];
  let value = subdomain[hostname];
  if (!value) {
    return;
  }
  http.pathname = value + '/' + http.pathname;
});