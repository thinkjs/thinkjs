/**
 * configs in development enviroment
 * @type {Object}
 */
let configs = {
  auto_reload: true,
  log_request: true,
  gc: {
    on: false
  },
  error: {
    detail: true
  },
  db: {
    log_sql: true,
    log_connect: true,
    schema_force_update: true
  },
  post: {
    log_error: true
  }
};

if(think.cli){
  configs = think.extend(configs, {
    auto_reload: false,
    process_timeout: 0
  });
}

export default configs;