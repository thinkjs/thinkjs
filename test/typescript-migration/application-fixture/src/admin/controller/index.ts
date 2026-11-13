import BaseController from './base';
export default class IndexController extends BaseController {
  indexAction() {
    const item: number = this.model('item').adminOnly();
    const commonItem: string = this.model('item', undefined, 'common').commonOnly();
    const title: string = this.service('catalog', this.model('item')).title();
    const localService: number = this.service('identity').label;
    const commonService: string = this.ctx.service('identity').label;
    const label: number = this.config('label');
    const commonLabel: string = this.config('label', undefined, 'common');
    const table: string = this.model('unregistered_table').tableName;
    return this.success({item, commonItem, title, localService, commonService, label, commonLabel, table});
  }
  blockedAction() { throw new Error('Logic must stop this action'); }
}
