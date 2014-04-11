//var net = require("net");


//var CRLF = "\r\n";
module.exports = Class(function(){
	return {
		init: function(port, hostname){
			this.port = port || 11211;
			this.hostname = hostname || "localhost";
			this.buffer = "";
			this.handle = null;
		}
	}
})