module.exports = Action(function(){
    return {
        init: function(){
            
        },
        indexAction: function(){
            var cookie = this.cookie("name");
            this.header("Access-Control-Allow-Origin", "*");
            console.log(__request.headers);
            //this.cookie("name", "welefen test");
            this.echo("welefen");
            this.end();
            //this.redirect("http://www.baidu.com");
        },
        testAction: function(test, test2){
            console.log("test value: " + test + ","+test2);
            this.end();
        }
    }
});