/**
 * view
 * @return {[type]} [description]
 */
module.exports = Class(function(){
    return {
        tVar: {},
        init: function(http){
            this.tVar = {};
            this.http = http;
        },
        /**
         * 给变量赋值
         * @param  {[type]} name  [description]
         * @param  {[type]} value [description]
         * @return {[type]}       [description]
         */
        assign: function(name, value){
            if (name === undefined) {
                return this.tVar;
            };
            if (isString(name) && arguments.length === 1) {
                return this.tVar[name];
            };
            if (isObject(name)) {
                this.tVar = extend(this.tVar, name);
            }else{
                this.tVar[name] = value;
            }
        },
        /**
         * 获取变量的值
         * @param  {[type]} name [description]
         * @return {[type]}      [description]
         */
        get: function(name){
            if (!name) {
                return this.tVar;
            };
            return this.tVar[name];
        },
        /**
         * 输出模版文件内容
         * @param  {[type]} templateFile [description]
         * @param  {[type]} charset      [description]
         * @param  {[type]} contentType  [description]
         * @param  {[type]} content      [description]
         * @return {[type]}              [description]
         */
        display: function(templateFile, charset, contentType, content){
            var self = this;
            return tag("view_init", this.http).then(function(){
                return self.fetch(templateFile, content);
            }).then(function(content){
                self.render(content, charset, contentType);
                return tag("view_end", self.http, content);
            }).then(function(){
                return self.http.end();
            }).catch(function(){
                return self.http.end();
            })
        },
        /**
         * 渲染模版
         * @param  {[type]} content     [description]
         * @param  {[type]} charset     [description]
         * @param  {[type]} contentType [description]
         * @return {[type]}             [description]
         */
        render: function(content, charset, contentType){
            if (!this.http.cthIsSend) {
                if (charset === undefined) {
                    charset = C('encoding');
                };
                if (contentType === undefined) {
                    contentType = C('tpl_content_type');
                };
                this.http.setHeader("Content-Type", contentType + "; charset=" + charset);
            };
            if (C('show_exec_time')) {
                this.http.sendTime("Exec-Time");
            };
            this.http.echo(content || "", C('encoding'));
        },
        /**
         * 获取模版文件内容
         * @param  {[type]} templateFile [description]
         * @param  {[type]} content      [description]
         * @return {[type]}              [description]
         */
        fetch: function(templateFile, content){
            var self = this;
            var promise = getPromise("");
            if (content === undefined) {
                promise = tag("view_template", this.http, templateFile).then(function(file){
                    templateFile = !isFile(file) ? "" : file;
                })
            };
            return promise.then(function(){
                if (!templateFile) {
                    return "";
                };
                return tag("view_parse", self.http, {
                    "var": self.tVar,
                    "file": templateFile,
                    "content": content
                }).then(function(content){
                    return tag("view_filter", self.http, content);
                })
            }).catch(function(err){
                //输出模版解析异常
                console.log(err);
            })
        }
    }
})