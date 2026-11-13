import type Item from '../model/item';
export default class Catalog {
  constructor(private item: Item) {}
  title() { return 'item:' + this.item.adminOnly(); }
}
