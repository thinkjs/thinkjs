/**
 * REST Controller
 * @return {[type]} [description]
 */
module.exports = Controller(function(){
  'use strict';
	return {
		__before: function(){
      
		},
		__call: function(){
			this.end('method is not allowed');
		}
	}
})