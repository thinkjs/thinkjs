/**
 * message
 * @type {Object}
 */
module.exports = {
  CONTROLLER_NOT_FOUND: 'controller `%s` not found. url is `%s`.',
  CONTROLLER_INVALID: 'controller `%s` is not valid. url is `%s`',
  ACTION_NOT_FOUND: 'action `%s` not found. url is `%s`',
  ACTION_INVALID: 'action `%s` is not valid. url is `%s`',
  WORKER_DIED: 'worker `%d` died, it will auto restart.',
  MIDDLEWARE_NOT_FOUND: 'middleware `%s` not found',
  ADAPTER_NOT_FOUND: 'adapter `%s` not found',
  GCTYPE_MUST_SET: 'instance must have gcType property',
  CONFIG_NOT_FUNCTION: 'config `%s` is not a function',
  PATH_EMPTY: '`%s` path muse be set',
  PATH_NOT_EXIST: '`%s` is not exist',
  TEMPLATE_NOT_EXIST: 'can\'t find template file `%s`',
  PARAMS_EMPTY: '`%s` value can\'t empty',
  PARAMS_NOT_VALID: '`{name}` value not valid'
}