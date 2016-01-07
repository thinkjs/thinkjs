/// <reference path="../../../typings/thinkjs/think.d.ts" />

'use strict';

import Base from './base';

export default class extends Base {
  /**
   * index action
   * @return {Promise} []
   */
  indexAction(){
    //auto render template file index_index.html
    return this.display();
  }
}