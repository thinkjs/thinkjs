import { think as importedThink, Think, Context } from 'thinkjs';
const globalThink: Think = think;
const namedThink: Think = importedThink;
class Controller extends think.Controller {
  indexAction() { return this.ctx; }
}
class Service extends think.Service {}
declare const context: Context;
new Controller(context);
new Service();
void [globalThink, namedThink];
