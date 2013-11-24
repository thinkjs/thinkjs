/**
 * 阻止ip来源访问
 * @return {[type]} [description]
 */
module.exports = Behavior(function(){
    return {
        options: {
            deny_ip: [] //阻止的ip列表
        },
        run: function(){
            if (this.options.deny_ip.length == 0) {
                return true;
            };
            var clientIps = (this.http.ip() + "").split(".");
            var flag = this.options.deny_ip.some(function(item){
                return (item + "").split(".").every(function(num, i){
                    if (num == "*" || num == clientIps[i]) {
                        return true;
                    };
                })
            });
            if (flag) {
                throw_error({
                    type: "deny",
                    msg: "deny ip",
                    code: 403,
                }, this.http);
            };
            return true;
        }
    }
});