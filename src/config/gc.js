'use strict';

/**
 * gc configs
 */
export default {
  on: true,
  interval: 3600, // one hour
  filter: function(){
    let hour = (new Date()).getHours();
    if(hour === 4){
      return true;
    }
  }
};