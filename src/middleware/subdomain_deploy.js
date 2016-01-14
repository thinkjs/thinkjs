'use strict';

import subdomain from './subdomain.js';

/**
 * subdomain deploy
 * @type {}
 */
export default class extends subdomain {
  /**
   * run
   * @return {Promise} []
   */
  run(){
    think.log('`subdomain_deploy` middleware is deprecated, use `subdomain` instead', 'WARNING');
    return super.run();
  }
}