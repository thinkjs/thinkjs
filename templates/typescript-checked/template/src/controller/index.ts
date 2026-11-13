import BaseController from './base';
import { readFileSync } from 'fs';
import { join } from 'path';
// Read once on worker startup, demonstrating resource-triggered reloads.
const resourceMessage = readFileSync(join(__dirname, '../assets/message.txt'), 'utf8').trim();
export default class IndexController extends BaseController {
  indexAction() {
    return this.success(this.service('greeting', this.config('greeting')).message());
  }
  resourceAction() {
    return this.success(resourceMessage);
  }
}
