import FileStore = require('think-store-file');
import Deep = require('think-store-file/index');
import Compiled = require('think-store-file/lib/index');
import DefaultStore from 'think-store-file';
import {Stats} from 'fs';

const store = new FileStore('/tmp/store');
const root: string = store.storePath;
store.storePath = '/tmp/other';
const read: Promise<string | undefined> = store.get('nested/file');
const write: Promise<boolean> = store.set('file', 'text');
store.set('file', Buffer.from('buffer'));
store.set('file', new Uint16Array([1, 2]));
store.set('file', new DataView(new ArrayBuffer(4)));
const append: Promise<void> = store.append('file', Buffer.from('more'));
const remove: Promise<void> = store.delete('file');
const access: Promise<void> = store.has('file');
const info: Promise<Stats | undefined> = store.info('file');
info.then(stat => { if (stat) { const size: number = stat.size; const file: boolean = stat.isFile(); return [size, file, stat.mtime]; } });
read.then(text => { if (text !== undefined) return text.toUpperCase(); });
new Deep('/tmp/store'); new Compiled('/tmp/store'); new DefaultStore('/tmp/store');
// @ts-expect-error Paths must be strings.
new FileStore(42);
// @ts-expect-error A path is required.
store.get();
// @ts-expect-error Content must be supported by filesystem writes.
store.set('file', {});
// @ts-expect-error Append accepts text or Uint8Array/Buffer, not arbitrary arrays.
store.append('file', [1, 2]);
// @ts-expect-error has resolves undefined, not an existence boolean.
const existence: Promise<boolean> = store.has('file');
// @ts-expect-error set returns the chmod result, not void.
const noResult: Promise<void> = store.set('file', 'text');
// @ts-expect-error Missing files have no content.
const requiredText: Promise<string> = store.get('file');
// @ts-expect-error Missing files have no Stats.
const requiredStat: Promise<Stats> = store.info('file');
// @ts-expect-error Classes require new.
FileStore('/tmp/store');
void [root, read, write, append, remove, access, info, existence, noResult, requiredText, requiredStat];

// The runtime-only symbol helper must not make structural implementations nominal.
declare const publicShape: Pick<FileStore, 'storePath' | 'get' | 'set' | 'delete' | 'append' | 'has' | 'info'>;
const structural: FileStore = publicShape;
void structural;
