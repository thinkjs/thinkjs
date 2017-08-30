// Type definitions for think-logger in ThinkJs 3.x
// Project: https://thinkjs.org/
// Definitions by: SijieCai <https://github.com/SijieCai>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

declare namespace ThinkLogger {
  export interface Logger {
    debug(msg: string): void;
    info(msg: string): void;
    warn(msg: string): void;
    error(msg: string): void;
  }
}
export = ThinkLogger;