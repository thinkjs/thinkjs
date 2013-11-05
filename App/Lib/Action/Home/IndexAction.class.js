module.exports = Action(function(){
    return {
        indexAction: function(){
            var self = this;
            think_require("UserModel")();
            this.end();
        },
        testAction: function(test, test2){
            this.echo("welefen");
            this.end();
        }
    }
});