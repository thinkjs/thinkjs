module.exports = Action(function(){
    return {
        init: function(){
            
        },
        indexAction: function(){
            var cookie = this.cookie("name");
            throw_error("welefen");
        },
        testAction: function(test, test2){
            console.log("test value: " + test + ","+test2);
            this.end();
        }
    }
});