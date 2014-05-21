/**
 * REST Controller
 * @return {[type]} [description]
 */
module.exports = Controller(function(){
	return {
		__before: function(){

		},
		__call: function(){
			this.end("method is not allowed");
		}
	}
})