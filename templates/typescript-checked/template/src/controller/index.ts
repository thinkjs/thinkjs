import BaseController from './base';
export default class IndexController extends BaseController {
  indexAction() {
    return this.success(this.service('greeting', this.config('greeting')).message());
  }
}
