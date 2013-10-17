var action = Action(function(){
    return {
        init: function(){
            
        },
        test: function(test, test2){
            console.log("test value: " + test + ","+test2)
        }
    }
});

module.exports = action;