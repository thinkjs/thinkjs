import type {} from 'think-model';
import records = require('./records.json');
export default class Item extends think.Model {
  adminOnly() { return records[0].id; }
}
