var action  = module.exports = Action(function(){
    return {
        /*init: function(){
            this.super("init");
        }*/
        indexAction: function(){
            this.assign({ //assign variables
                name: "welefen"
            })
            this.display(); //render Home/index_index.html file
        }
    }
});