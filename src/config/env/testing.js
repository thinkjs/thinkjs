'use strict';
/**
 * configs in testing enviroment
 */

let configs = {};

if(think.cli){
  configs = think.extend(configs, {
    gc: {
      on: false
    },
    auto_reload: false,
    process_timeout: 0
  });
}


export default configs;