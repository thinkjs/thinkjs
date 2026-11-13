import type IndexController from './admin/controller/index';
// The function is never run; real tsc must verify every negative case.
export function invalid(controller: IndexController) {
  // @ts-expect-error generated literal Service names are checked
  controller.service('missing');
  // @ts-expect-error custom Service constructor requires the custom Model
  controller.service('catalog', 'wrong');
  // @ts-expect-error admin's own Model replaces common's Model
  controller.model('item').commonOnly();
  // @ts-expect-error table fallback retains the base Model rather than any
  controller.model('unregistered_table').adminOnly();
  // @ts-expect-error the current module Config has a number value
  controller.config('label', 'wrong');
}
