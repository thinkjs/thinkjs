/**
 * jade
 * @type {[type]}
 */
var jade = require("jade");
var template = module.exports = {
    fetch: function(templateFile, tVar){
        var content = file_get_contents(templateFile);
        var fn = jade.compile(content, {});
        var html = fn(tVar);
        return html;
    }
}