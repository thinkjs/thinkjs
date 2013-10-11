var action = Action(function(){
    return {
        init: function(){
            console.log("indexAction init");
        },
        test: function(){
            console.log("test")
        }
    }
});

module.exports = action;