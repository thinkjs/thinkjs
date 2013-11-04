/**
 * jade模版引擎
 * expressjs默认为该模版引擎
 * @type {[type]}
 */
var jade = require("jade");

module.exports = {
    fetch: function(templateFile, tVar){
        var content = file_get_contents(templateFile);
        var fn = jade.compile(content, {});
        var html = fn(tVar);
        return html;
    }
};