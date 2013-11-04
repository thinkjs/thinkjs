module.exports = Action(function(){
    return {
        indexAction: function(){
            this.display();
        },
        testAction: function(test, test2){
            this.echo("welefen");
            this.end();
        }
    }
});