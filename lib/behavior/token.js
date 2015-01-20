/**
 * 给表单生成token
 * @param  {[type]} content){               }} [description]
 * @return {[type]}            [description]
 */
module.exports = Behavior(function(){
  'use strict';
  return {
    run: function(content){
      if (!C('token_on')) {
        return content;
      }
      return this.getToken().then(function(token){
        var key = C('token_key');
        var name = C('token_name');
        if (content.indexOf(key) > -1) {
          return content.replace(key, token);
        }else if (content.indexOf('</form>') > -1) {
          return content.replace('</form>', '<input type="hidden" name="' + name +'" value="' + token + '" /></form>');
        }else{
          return content.replace('</head>', '<meta name="' + name + '" content="' + token + '" /></head>');
        }
      })
    },
    /**
     * 获取token值
     * @return {[type]} [description]
     */
    getToken: function(){
      var Session = thinkRequire('Session');
      Session.start(this.http);
      var tokenName = C('token_name');
      var http = this.http;
      return http.session.get(tokenName).then(function(value){
        if (value) {
          return value;
        }
        var token = Session.uid(32);
        return http.session.set(tokenName, token).then(function(){
          return token;
        })
      })
    }
  }
})