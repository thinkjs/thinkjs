/**
 * ejs
 * https://github.com/visionmedia/ejs
 * @type {[type]}
 */
var ejs = require("ejs");
module.exports = {
    fetch: function(templateFile, tVar){
        var content = file_get_contents(templateFile);
        var fn = ejs.compile(content, C('tpl_engine_config'));
        var html = fn(tVar);
        return html;        
    }
}