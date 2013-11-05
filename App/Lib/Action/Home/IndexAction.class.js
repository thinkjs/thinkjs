module.exports = Action(function(){
    return {
        indexAction: function(){
            var self = this;
            var user = think_require("UserModel");
            var test = think_require("TestModel");
            test();
            user();
            test();
            this.end();
        },
        testAction: function(test, test2){
            this.echo("welefen");
            this.end();
        }
    }
});