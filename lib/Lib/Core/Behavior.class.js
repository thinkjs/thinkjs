/**
 * 行为类
 * @return {[type]} [description]
 */
module.exports = Class(function(){
    return {
        options: {}, //行为选项
        http: null,
        init: function(http){
            this.http = http;
            for(var name in this.options){
                if (C(name) !== undefined) {
                    this.options[name] = C(name);
                }else{
                    C(name) = this.options[name];
                }
            }
        },
        run: function(){
            
        }
    }
});