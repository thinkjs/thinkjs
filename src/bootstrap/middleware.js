'use strict';

import fs from 'fs';
import './_payload.js';

/**
 * output file
 * @param  {Object} http    []
 * @param  {String} file [file path]
 * @return {}         []
 */
think.middleware('output_resource', (http, file) => {
  let deferred = think.defer();
  let stream = fs.createReadStream(file);
  stream.pipe(http.res);
  stream.on('end', () => {
    http.end();
    deferred.resolve(file);
  });
  stream.on('error', err => {
    deferred.reject(err);
  });
  return deferred.promise;
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