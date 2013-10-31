module.exports = Action(function(){
    return {
        init: function(){
            
        },
        indexAction: function(){
            var cookie = this.cookie();
            this.echo(cookie);
            var delay = this.get('delay');
            var self = this;
            setTimeout(function(){
                self.end(self.cookie());
            }, delay * 1000)
        },
        testAction: function(test, test2){
            this.echo("welefen");
            this.end();
        }
    }
});