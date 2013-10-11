/**
 * 检测路由行为
 * 通过自定义路由识别到对应的URL上
 * @return {[type]} [description]
 */
var behavior = Behavior(function(){
    return {
        options: {
            'url_route_on': false, //是否开启自定义URL路由
            'url_route_rules': [] //自定义URL路由规则
        },
        run: function(){
            console.log(this.options);
        }
    }
});
module.exports = behavior;