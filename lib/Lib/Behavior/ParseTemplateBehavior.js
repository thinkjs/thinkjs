/**
 * 调用对应的模版引擎解析模版
 * @return {[type]} [description]
 */
module.exports = Behavior(function(){
    "use strict";
    return {
        run: function(data){
            var file = data.content || data.file;
            //将模版文件路径写入到http对象上，供writehtmlcache里使用
            this.http.tpl_file = file;
            var engine = C('tpl_engine_type');
            //不使用模版引擎，直接返回文件内容
            if (!engine) {
                return getFileContent(file);
            }
            var engineClass = ucfirst(engine) + "Template";
            return thinkRequire(engineClass).fetch(file, data.var);
        }
    };
});