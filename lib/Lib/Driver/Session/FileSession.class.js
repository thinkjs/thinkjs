/**
 * 文件Session
 * @return {[type]} [description]
 */

var os = require("os");
var fs = require("fs");
module.exports = Session(function(){
    return {
        file: "",
        data: null,
        init: function(http){
            this.super("init", http);
            this.data = null;

            var tmpDir = os.tmpdir() + "/thinkjs/";
            mkdir(tmpDir);

            this.file = tmpDir + this.cookie + ".json";
        },
        get: function(name){
            var deferrd = when.defer();
            if (this.data === null) {
                var data = file_get_contents(this.file);
                data = JSON.parse(data || "{}");
                this.data = data;
                var self = this;
                process.nextTick(function(){
                    deferrd.resolve(self.data[name]);
                })
            };
            return deferrd.promise;
        },
        set: function(name, value){
            this.data[name] = value;
        },
        rm: function(){
            fs.unlink(this.file, function(){});
        },
        flush: function(){
            var data = JSON.stringify(this.data);
            file_put_contents(this.file, data);
        }
    }
})