'use strict';

import CSRF from './csrf.js';

/**
 * check csrf
 * @type {}
 */
export default class extends CSRF {
  /**
   * run
   * @return {Promise} []
   */
  run(){
    think.log('`check_csrf` middleware is deprecated, use `csrf` instead', 'WARNING');
    return super.run();
  }
}