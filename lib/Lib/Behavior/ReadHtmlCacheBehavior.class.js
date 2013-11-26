/**
 * 读取HTML缓存
 * @return {[type]} [description]
 */
module.exports = Behavior(function(){
    return {
        options:{
            'html_cache_on': false, //是否开启缓存
            'html_cache_time': 60, //缓存时间
            'html_cache_rules': {}, //缓存规则
            'html_cache_file_suffix': ".html", //缓存文件扩展名
        },
        run: function(data){
            if (!this.options.html_cache_on) {
                return false;
            };
            
        }
    }
});