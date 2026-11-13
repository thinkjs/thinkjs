import type { ConfigCall } from 'think-config/config-types';
declare module 'think-config/config-types' {
  interface ConfigModules { admin: {value: number}; }
}
declare const global: ConfigCall<'multi'>;
declare const context: ConfigCall<'multi', string>;
declare const module: string;
const known: number = global('value', undefined, 'admin');
// @ts-expect-error common is undescribed, so dynamic module fallback is unknown
const unknown: number = global('value', undefined, module);
// @ts-expect-error unbound context also includes undescribed common
const unbound: number = context('value');
// @ts-expect-error an all-module mutation cannot bypass undescribed common
global('value', 1, true);
// @ts-expect-error an arbitrary selector cannot bypass undescribed common
global('value', 1, module);
