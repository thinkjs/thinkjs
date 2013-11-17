/**
 * controller
 * @return 
 */
module.exports = Controller(function(){
    return {
        /*init: function(http){
            this.super("init", http);
        }*/
        indexAction: function(){
            this.end("hello, thinkjs!");
            //this.display(); //render Home/index_index.html file
        }
    }
});