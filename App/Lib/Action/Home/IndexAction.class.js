module.exports = Action(function(){
    return {
        indexAction: function(){
            console.log(this.http);
        },
        testAction: function(test, test2){
            this.echo("welefen");
            this.end();
        }
    }
});