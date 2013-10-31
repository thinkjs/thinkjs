/**
 * 缓存类
 * @return {[type]} [description]
 */
module.exports = Class(function(){
    return {
        handler: null,
        options: {},
        init: function(){
            this.handler = null;
            this.options = {}
        },
        connect: function(type, options){
            type = type || C("data_cache_type");
            type = type.trim().toLowerCase();
            var cls = ucfirst(type) + "Cache";
            return think_require(cls)(options);
        },
        run: function(){
            
        }
    }
});