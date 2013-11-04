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
        assign: function(name, value){
            if (is_object(name)) {
                this.tVar = extend(this.tVar, name);
            }else{
                this.tVar[name] = value;
            }
        },
        get: function(name){
            if (!name) {
                return this.tVar;
            };
            return this.tVar[name];
        },
        display: function(templateFile, charset, contentType, content){
            tag("view_begin", this.http);
            content = this.fetch(templateFile, content);
            this.render(content, charset, contentType);
            tag("view_end", this.http);
            this.http._res.end();
        },
        render: function(content, charset, contentType){
            if (charset === undefined) {
                charset = C('encoding');
            };
            if (contentType === undefined) {
                contentType = C('tpl_content_type');
            };
            this.http.res.setHeader("Content-Type", contentType + "; charset="+charset);
            this.http.res.setHeader("X-Powered-By", "thinkjs");
            this.http._res.write(content || "", C('encoding'));
        },
        fetch: function(templateFile, content){
            if (content === undefined) {
                templateFile = tag("view_template", , this.http, templateFile);
                if (!is_file(templateFile)) {
                    return "";
                };
            };
            content = tag("view_parse", , this.http, {
                "var": this.tVar,
                "file": templateFile,
                "content": content
            });
            content = tag("view_filter", this.http, content);
            return content;
        }
    }
})