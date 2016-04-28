'use strict';
/**
 * configs in production enviroment
 */

let configs = {
  view: {
    adapter: {
      jade: {
        cache_compile: true
      }
    }
  }
};

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