/**
 * 定位模版的行为
 * @return {[type]} [description]
 */

module.exports = Behavior(function(){
    return {
        run: function(templateFile){
            if (!is_file(templateFile)) {
                return this.parseTemplateFile(templateFile);
            };
        },
        parseTemplateFile: function(templateFile){
            templateFile = templateFile || "";
            if (!templateFile) {
                templateFile = [
                    TMPL_PATH, "/", __http.req.group, "/",
                    __http.req.module.toLowerCase(),
                    C('tpl_file_depr'),
                    __http.req.action.toLowerCase(),
                    C('tpl_file_suffix')
                ].join("");
            }else if(templateFile.indexOf(C('tpl_file_suffix')) === -1){
                var path = templateFile.split(":");
                var action = path.pop();
                var module = path.pop() || __http.req.module.toLowerCase();
                var group = ucfirst(path.pop()) || __http.req.group;
                templateFile = [
                    TMPL_PATH, "/", group, "/",
                    module, 
                    C('tpl_file_depr'),
                    action,
                    C('tpl_file_suffix')
                ].join("");
            }
            if (!is_file(templateFile)) {
                throw_error(templateFile + " is not exist");
            };
            return templateFile;
        }
    }
});