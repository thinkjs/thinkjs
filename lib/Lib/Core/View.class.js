var view = module.exports = Class(function(){
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
        display: function(templateFile, charset, conentType, content, prefix){
            tag("view_begin");
            content = this.fetch(templateFile, content, prefix);
            this.render(content, charset, contentType);
            tag("view_end");
        },
        render: function(conent, charset, contentType){
            if (charset === undefined) {
                charset = C('encoding');
            };
        }
    }
})