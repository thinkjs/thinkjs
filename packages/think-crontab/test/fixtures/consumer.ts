import Crontab = require('think-crontab');
import Deep = require('think-crontab/index');
import Compiled = require('think-crontab/lib/index');
import DefaultCrontab from 'think-crontab';

interface App { counter: number; }
const app: App = {counter: 0};
const options: Crontab.Task<App> = {
  handle(application) {
    application.counter++;
    const type: string = this.type;
    const label: string | undefined = this.taskName;
    return [type, label];
  },
  name: 'task', type: 'all', interval: '1s', immediate: false, enable: true
};
const cron = new Crontab(options, app);
const application: App = cron.app;
const normalized: Crontab.NormalizedTask<App>[] = cron.options;
const returned: void = cron.runTask();
cron.runItemTask(normalized[0]);
const parsed = cron.parseOptions({handle: '/job', cron: {hour: 8}});
const handle: Crontab.Handler<App> = parsed[0].handle;
handle.call(parsed[0], app);
new Deep(options, app);
new Compiled(options, app);
new DefaultCrontab(options, app);
new Crontab({handle(application) { const absent: undefined = application; return absent; }});
new Crontab({handle(application) { const count: number = application.counter; return count; }}, app);
new Crontab<App>(options, app);
new Crontab('/task');
new Crontab([{handle() {}, cron: new Date()}, {handle() {}, interval: 1000}]);
const missing: undefined = new Crontab([]).app;
// @ts-expect-error Application types are preserved.
const wrongApp: string = cron.app;
// @ts-expect-error Normalized tasks always have callable handlers.
const wrongHandler: string = normalized[0].handle;
// @ts-expect-error handle is required.
new Crontab({interval: 1});
// @ts-expect-error interval is a number or duration string.
new Crontab({handle() {}, interval: true});
// @ts-expect-error Explicit nonoptional applications must be supplied.
new Crontab<App>(options);
// @ts-expect-error Wrong application type.
new Crontab<App>(options, {counter: 'wrong'});
// @ts-expect-error Classes must be called with new.
Crontab([]);
void [application, returned, missing, wrongApp, wrongHandler];
