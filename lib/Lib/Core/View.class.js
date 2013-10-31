/**
 * view
 * @return {[type]} [description]
 */
module.exports = Class(function(){
    return {
        tVar: {},
        init: function(){
            this.tVar = {};
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
            tag("view_begin");
            content = this.fetch(templateFile, content);
            this.render(content, charset, contentType);
            tag("view_end");
            __response.end();
        },
        render: function(content, charset, contentType){
            if (charset === undefined) {
                charset = C('encoding');
            };
            if (contentType === undefined) {
                contentType = C('tpl_content_type');
            };
            __http.res.setHeader("Content-Type", contentType + "; charset="+charset);
            __http.res.setHeader("X-Powered-By", "thinkjs");
            __response.write(content || "", C('encoding'));
        },
        fetch: function(templateFile, content){
            if (content === undefined) {
                templateFile = tag("view_template", templateFile);
                if (!is_file(templateFile)) {
                    return "";
                };
            };
            content = tag("view_parse", {
                "var": this.tVar,
                "file": templateFile,
                "content": content
            });
            content = tag("view_filter", content);
            return content;
        }
    }
})