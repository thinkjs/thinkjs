'use strict';

import querystring from 'querystring';

/**
 * parse json payload
 * @type {}
 */
export default class extends think.middleware.base {
  /**
   * run
   * @return {} []
   */
  run(){
    let http = this.http;
    if(!http.req.readable){
      return;
    }

    let types = http.config('post.json_content_type');
    if (types.indexOf(http.type()) === -1) {
      return;
    }
    return http.getPayload().then(payload => {
      let data;
      try{
        data = JSON.parse(payload);
      }catch(e){
        //log error
        if(http.config('post.log_error')){
          think.log(new Error('JSON.parse error, payload is not a valid JSON data'));
        }
        //if using json parse error, then use querystring parse.
        //sometimes http header has json content-type, but payload data is querystring data
        data = querystring.parse(payload);
      }
      if(!think.isEmpty(data)){
        http._post = think.extend(http._post, data);
      }
      return null;
    });
  }
}