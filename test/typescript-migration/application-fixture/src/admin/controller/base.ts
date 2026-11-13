import type { Controller, Context } from 'thinkjs';
import type {} from 'think-model';
import type { AppController, AppContext } from '../../../.thinkjs/types';
type View = AppController<Controller, 'admin'>;
export default class BaseController extends think.Controller {
  declare service: View['service'];
  declare model: View['model'];
  declare config: View['config'];
  declare ctx: AppContext<Context, 'admin'>;
}
