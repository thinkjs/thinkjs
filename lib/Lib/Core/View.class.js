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
            if (is_string(name) && value === undefined) {
                return this.tVar[name];
            };
            if (is_object(name)) {
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
            tag("view_begin", this.http);
            content = this.fetch(templateFile, content);
            this.render(content, charset, contentType);
            tag("view_end", this.http);
            this.http.end();
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
            if (content === undefined) {
                templateFile = tag("view_template", this.http, templateFile);
                if (!is_file(templateFile)) {
                    return "";
                };
            };
            content = tag("view_parse", this.http, {
                "var": this.tVar,
                "file": templateFile,
                "content": content
            });
            content = tag("view_filter", this.http, content);
            return content;
        }
    }
})