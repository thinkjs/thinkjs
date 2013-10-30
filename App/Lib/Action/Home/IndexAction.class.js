module.exports = Action(function(){
    return {
        init: function(){
            
        },
        indexAction: function(){
            var cookie = this.cookie("name");
            //this.redirect("http://www.baidu.com");
            this.assign({
                name: "welefen"
            })
            this.display();
        },
        testAction: function(test, test2){
            console.log("test value: " + test + ","+test2);
            this.end();
        }
    }
});