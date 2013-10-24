var action = Action(function(){
    return {
        init: function(){
            
        },
        index: function(){
            console.log('index action');
            this.end();
        },
        test: function(test, test2){
            console.log("test value: " + test + ","+test2);
            this.end();
        }
    }
});

module.exports = action;