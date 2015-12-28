
import querystring from 'querystring';




/**
 * parse payload by querystring
 * @param  {Object} http []
 * @return {[type]}      []
 */
think.middleware('parse_querystring_payload', http => {

  if (!http.req.readable) {
    return;
  }
  
  return http.getPayload().then(payload => {
    http._post = think.extend(http._post, querystring.parse(payload));
  });
});


/**
 * validate data parsed from payload 
 * @param  {Object} http []
 * @return {}      []
 */
think.middleware('validate_payload', http => {
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
});