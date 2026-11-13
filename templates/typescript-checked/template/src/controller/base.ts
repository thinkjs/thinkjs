import type {Controller, Context} from 'thinkjs';
import type {AppController, AppContext} from '../../.thinkjs/types';
type View = AppController<Controller>;
export default class BaseController extends think.Controller {
  declare service: View['service'];
  declare config: View['config'];
  declare ctx: AppContext<Context>;
}
