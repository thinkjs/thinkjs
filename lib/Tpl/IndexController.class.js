/**
 * controller
 * @return 
 */
module.exports = Controller(function(){
    return {
        indexAction: function(){
        	//render Tpl/Home/index_index.html file
            this.display(); 
        }
    }
});