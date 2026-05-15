import { EventEmitter } from 'events';

export interface WorkerOptions {
  port?: number;
  workers?: number;
  exec?: string;
  silent?: boolean;
  maxErrTimes?: number;
}

export declare class Worker {
  constructor(options?: WorkerOptions);
  getServer(): number;
  getForkArg(port: number): string[];
  captureException(callback?: (worker: any, code: number, signal: string) => void): void;
  forkWorker(port?: number, index?: number): any;
  forkWorkers(): void;
  start(callback?: (port: number) => void): void;
}

export declare class Messenger extends EventEmitter {
  workerIds: Record<string, number>;
  callbacks: Record<string, Function>;
  constructor();
  bind(): void;
  send(data: Record<string, any>): void;
  broadcast(data: Record<string, any>, isMaster?: boolean): void;
  getAllWorkers(): number[];
  getLeaderWorker(): number;
  runInOne(fn: Function): void;
}

export declare const messenger: Messenger;

export declare class Master {
  constructor(options?: Record<string, any>);
  start(): Promise<void>;
}
