/**
 * REST Controller
 * @return {[type]} [description]
 */
modulex.exports = Controller(function(){
	return {
		__before: function(){

		},
		__call: function(){
			this.end("method is not allowed");
		}
	}
})