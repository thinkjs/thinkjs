import type { Logic } from 'thinkjs';
import type { AppController } from '../../../.thinkjs/types';
export default class IndexLogic extends think.Logic {
  declare config: AppController<Logic, 'admin'>['config'];
  indexAction() { this.header('x-logic-label', String(this.config('label'))); }
  blockedAction() { this.fail(1001, 'blocked-by-logic'); return false; }
}
