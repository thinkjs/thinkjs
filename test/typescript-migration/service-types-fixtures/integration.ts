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
// No casts, runtime helper, shadow global, or changes to the legacy overloads.
export function globalCounter(source: Think) {
  const typed: ThinkServices<Think, 'multi'> = source;
  return typed.service('counter', 'admin', 42).count;
}
// Legacy Context/Controller signatures incorrectly restrict argument two to string.
// Accept the typed boundary here; converting legacy objects needs one assertion
// until those unrelated declarations are repaired.
export function contextCounter(typed: ContextServices<Context, 'multi'>) {
  return typed.service('counter', 'admin', 43).count;
}
export function controllerCounter(typed: ControllerServices<Controller, 'multi', 'admin'>) {
  return typed.service('counter', 'admin', 44).count;
}
