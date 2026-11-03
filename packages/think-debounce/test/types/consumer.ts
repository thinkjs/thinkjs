import Debounce = require('../..');

const instance = new Debounce();
const synchronous: Promise<number> = instance.debounce('number', () => 42);
const asynchronous: Promise<{id: string}> = instance.debounce('object', async () => ({id: 'a'}));
const thenable: Promise<string> = instance.debounce('thenable', (): PromiseLike<string> => Promise.resolve('ok'));
const empty: Promise<void> = instance.debounce('void', () => {});
const rejection: Promise<never> = instance.debounce('throw', () => { throw new Error('failed'); });
void [synchronous, asynchronous, thenable, empty, rejection];
// @ts-expect-error Keys must be strings.
instance.debounce(1, () => 1);
// @ts-expect-error A callback is required.
instance.debounce('missing');
// @ts-expect-error A callback must be callable.
instance.debounce('invalid', 42);
// @ts-expect-error Result types are inferred from the callback.
const wrong: Promise<string> = instance.debounce('number', () => 42);
void wrong;
