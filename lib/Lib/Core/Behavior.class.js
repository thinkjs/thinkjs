/**
 * 行为类
 * @return {[type]} [description]
 */
var Behavior = Class(function(){
    return {
        options: {}, //行为选项
        init: function(){
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
module.exports = Behavior;