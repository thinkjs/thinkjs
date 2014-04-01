/**
 * ejs
 * https://github.com/visionmedia/ejs
 * @type {[type]}
 */
var ejs = require("ejs");
module.exports = {
    fetch: function(templateFile, tVar){
		"use strict";
        var content = getFileContent(templateFile);
        var conf = C('tpl_engine_config');
        conf.filename = templateFile;	//enable include
        var fn = ejs.compile(content, conf);
        var html = fn(tVar);
        return html;        
    }
};