/**
 * ejs
 * https://github.com/visionmedia/ejs
 * @type {[type]}
 */
var ejs = require("ejs");
module.exports = {
    fetch: function(templateFile, tVar){
        var content = file_get_contents(templateFile);
        var conf = C('tpl_engine_config');
        conf.filename = templateFile;	//enable include
        var fn = ejs.compile(content, conf);
        var html = fn(tVar);
        return html;        
    }
}