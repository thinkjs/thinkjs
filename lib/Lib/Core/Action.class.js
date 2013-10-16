/**
 * Action基类
 * @return {[type]} [description]
 */
var action = module.exports = Class(function(){
    return {
        init: function(){
            tag('action_start');
        },
        _get: function(name){
            return __http.req.query[name] || "";
        },
        _post: function(name){
            return __http.req.post[name] || "";
        },
        _param: function(name){
            return this._post(name) || this._get(name);
        }
    }
});