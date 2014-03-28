/**
 * controller
 * @return 
 */
module.exports = Controller(function(){
    return {
        indexAction: function(){
            this.display("index:index"); 
        },
        docAction: function(doc){
        	var viewFile = VIEW_PATH + "/Home/doc_" + doc + ".html";
        	if (isFile(viewFile)) {
        		this.display("doc:" + doc);
        	}else{
        		this.display("index:index");
        	}
        }
    }
});