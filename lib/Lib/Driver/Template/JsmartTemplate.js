'use strict';

/**
 * jsmarty模版引擎
 * @type {[type]}
 */
var jSmart = require('jsmart');
var path = require('path');

/**
   override this function
   @param name  value of 'file' parameter in {include} and {extends}
   @return template text
*/
jSmart.prototype.getTemplate = function(name)
{
	return getFileContent(path.resolve(VIEW_PATH, name));
}

/**
   override this function
   @param name  value of 'file' parameter in {fetch}
   @return file content
*/
jSmart.prototype.getFile = function(name)
{
	return getFileContent(path.resolve(VIEW_PATH, name));
}

/**
   override this function
   @param name  value of 'file' parameter in {include_php} and {include_javascript}
				 or value of 'script' parameter in {insert}
   @return Javascript script
*/
jSmart.prototype.getJavascript = function(name)
{
	throw new Error('No Javascript for ' + name);
}

/**
   override this function
   @param name  value of 'file' parameter in {config_load}
   @return config file content
*/
jSmart.prototype.getConfig = function(/*name*/)
{
	return C('tpl_engine_config');
}

extend(jSmart.prototype, C('tpl_engine_config'));

module.exports = {
	fetch: function(templateFile, tVar){
		var content = getFileContent(templateFile);
		var compiledTpl = new jSmart(content);
		return compiledTpl.fetch(tVar);
	}
};