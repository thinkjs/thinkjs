/**
 * 读取HTML缓存
 * @return {[type]} [description]
 */
module.exports = Behavior(function(){
    return {
        options:{
            'html_cache_on': false, //是否开启缓存
            'html_cache_time': 3600, //缓存时间
            'html_cache_rules': {}, //缓存规则
            'html_cache_file_callback': undefined, //生成缓存文件的回调函数
            'html_cache_file_suffix': ".html", //缓存文件扩展名
        },
        run: function(data){
            if (!this.options.html_cache_on || is_empty(this.options.html_cache_rules)) {
                return false;
            };
            var cacheTime = this.getCacheTime();
            var stats = require("fs").lstatSync(TPL_PATH);
            console.log(stats)
            if (cacheTime === false) {
                return false;
            };

        },
        /**
         * 获取缓存时间
         * @return {[type]} [description]
         */
        getCacheTime: function(){
            /**
             * rules数据格式
             * {
             *     'index:index': ['index_home', 1800, html_cache_path]
             * }
             * @type {[type]}
             */
            var rules = this.options.html_cache_rules;
            var group = this.http.group.toLowerCase();
            var controller = this.http.controller.toLowerCase();
            var action = this.http.action.toLowerCase();
            var list = [
                group + ":" + controller + ":" + action,
                controller + ":" + action,
                action,
                "*"
            ];
            var html = [];
            list.some(function(item){
                if (item in rules) {
                    html = rules[item];
                    return true;
                };
            });
            if (is_empty(html)) {
                return false;
            };
            if (!is_array(html)) {
                html = [html];
            };
            var rule = html[0];
            var pars = extend({}, this.http.get);
            pars = extend(pars, {
                ":group": group,
                ":controller": controller,
                ":action": action
            });
            rule = rule.replace(/\{([\w\:]+)\}/g, function(a, name){
                return pars[name] || "";
            });
            var callback = html[2] || C('html_cache_file_callback') || this.getCacheFilename;
            var filename = callback(rule) + this.options.html_cache_file_suffix;
            //静态缓存文件名
            this.http.html_filename = filename;
            var cacheTime = rule[1] || this.options.html_cache_time;
            return cacheTime;
        },
        /**
         * 
         * @param  {[type]} key [description]
         * @return {[type]}     [description]
         */
        getCacheFilename: function(key){
            return md5(key);
        },
        /**
         * [checkCacheTime description]
         * @return {[type]} [description]
         */
        checkCacheTime: function(){

        }
    }
});