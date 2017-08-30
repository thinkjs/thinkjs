import * as ThinkJs from 'thinkjs';
export default (options: object, app: ThinkJs.Koa) => {
  return (ctx, next) => {
    return next();
  };
};
