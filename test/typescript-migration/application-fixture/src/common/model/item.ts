import type {} from 'think-model';
export default class Item extends think.Model {
  commonOnly() { return 'common-item'; }
}
