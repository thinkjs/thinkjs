module.exports = Action(function(){
    return {
        indexAction: function(){
            var self = this;
            var config = {
                user: "root",
                password: "SuredY0706$",
                database: "www.ueapp.com"
            }
            var instance = think_require("MysqlSocket")(config);
            instance.query("select * from meinv_group limit 1").then(function(data){
                self.end(data);
            });
        },
        testAction: function(test, test2){
            this.echo("welefen");
            this.end();
        }
    }
});