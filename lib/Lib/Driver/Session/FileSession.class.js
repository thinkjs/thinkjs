/**
 * 文件Session
 * @return {[type]} [description]
 */

var os = require("os");
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

            var file = this.file();
            var data = file_get_contents(file);
            data = JSON.parse(data || "{}");
            this.data = data;
        },
        get: function(name){
            return this.data[name];
        },
        set: function(name, value){
            this.data[name] = value;
        },
        flush: function(){
            var data = JSON.stringify(this.data);
            file_put_contents(this.file, data);
        }
    }
})