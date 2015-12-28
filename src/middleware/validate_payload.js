'use strict';

/**
 * validate post data
 * @type {}
 */
export default class extends think.middleware.base {
  /**
   * run
   * @return {} []
   */
  run(){
    let http = this.http;
    let post = http._post;
    let length = Object.keys(post).length;
    if (length > think.config('post.max_fields')) {
      http.res.statusCode = 400;
      http.end();
      return think.prevent();
    }
    let maxFilesSize = think.config('post.max_fields_size');
    for(let name in post){
      if (post[name] && post[name].length > maxFilesSize) {
        http.res.statusCode = 400;
        http.end();
        return think.prevent();
      }
    }
  }
}