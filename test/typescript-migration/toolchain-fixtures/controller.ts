export default class Controller extends think.Controller {
  indexAction() { return this.service('class', 'from-controller').value; }
}
