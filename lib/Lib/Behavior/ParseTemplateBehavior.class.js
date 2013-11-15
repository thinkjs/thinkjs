/**
 * 调用对应的模版引擎解析模版
 * @return {[type]} [description]
 */
module.exports = Behavior(function(){
    return {
        run: function(data){
            var content = data.content || data.file;
            var engine = C('tpl_engine_type');
            //不使用模版引擎，直接返回文件内容
            if (!engine) {
                return file_get_contents(content);
            };
            var engineClass = ucfirst(engine) + "Template";
            return think_require(engineClass).fetch(content, data.var);
        }
    }
});