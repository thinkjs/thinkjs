import Application from '../lib/application.js';
import {think, installGlobal} from './runtime.js';

installGlobal();
export {Application, think, installGlobal};
export const Controller = think.Controller;
export const Logic = think.Logic;
export const Service = think.Service;

// Compatibility convenience; all startup goes through Application.run().
export function createApp(manifest = {}, options = {}) {
  return new Application({...options, manifest, runtime: 'edge'}).run();
}
export default Application;
