module.exports = Action(function(){
    return {
        init: function(){
            
        },
        indexAction: function(){
            var cookie = this.cookie("name");
            S("name");
            this.display();
        },
        testAction: function(test, test2){
            this.echo("welefen");
            this.end();
        }
    }
});