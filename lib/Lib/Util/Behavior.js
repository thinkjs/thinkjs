/**
 * 行为类
 * @return {[type]} [description]
 */
module.exports = Class(function(){
    "use strict";
    return {
        options: {}, //行为选项
        http: null,
        init: function(http){
            this.http = http;
            for(var name in this.options){
                if (C(name) !== undefined) {
                    this.options[name] = C(name);
                }
            }
        },
        run: function(){
            
        }
    };
});