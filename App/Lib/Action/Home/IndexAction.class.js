module.exports = Action(function(){
    return {
        init: function(){
            
        },
        indexAction: function(){
            var cookie = this.cookie();
            this.end(cookie);
        },
        testAction: function(test, test2){
            this.echo("welefen");
            this.end();
        }
    }
});