import type {Think, Context, Controller} from 'thinkjs';
import type {ThinkServices, ContextServices, ControllerServices} from 'thinkjs/service-types';
class Counter {
  constructor(readonly count: number) {}
}
declare module 'thinkjs/service-types' {
  interface ServiceModules {
    common: {counter: typeof Counter};
    admin: {counter: typeof Counter};
  }
}
// No casts, runtime helper or shadow global are needed at the typed boundary.
export function globalCounter(source: Think) {
  const typed: ThinkServices<Think, 'multi'> = source;
  return typed.service('counter', 'admin', 42).count;
}
export function contextCounter(source: Context) {
  const typed: ContextServices<Context, 'multi'> = source;
  return typed.service('counter', undefined, 43).count;
}
export function controllerCounter(source: Controller) {
  const typed: ControllerServices<Controller, 'multi', 'admin'> = source;
  return typed.service('counter', 44).count;
}
