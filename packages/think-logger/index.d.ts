interface LoggerAdapter {
  trace(...args: any[]): void;
  debug(...args: any[]): void;
  info(...args: any[]): void;
  warn(...args: any[]): void;
  error(...args: any[]): void;
  getLogger(): any;
}

interface LoggerConfig {
  handle?: new(config: any) => LoggerAdapter;
  level?: string;
  [key: string]: any;
}

export declare class Logger implements LoggerAdapter {
  static Basic: any;
  static Console: any;
  static File: any;
  static DateFile: any;

  constructor(config?: LoggerConfig);
  trace(...args: any[]): void;
  debug(...args: any[]): void;
  info(...args: any[]): void;
  warn(...args: any[]): void;
  error(...args: any[]): void;
  getLogger(): any;
}

export = Logger;
