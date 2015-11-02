'use strict';
/**
 * configs in production enviroment
 */

let configs = {};

if(think.cli){
  configs = think.extend(configs, {
    gc: {
      on: false
    },
    auto_reload: false,
    log_pid: false,
    process_timeout: 0
  });
}


export default configs;