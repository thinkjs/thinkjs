declare namespace ThinkSequelize {
  interface SequelizeEmitters {
    // success
    // cb(obj?:any)
    success(cb:Function):SequelizeEmitters;
    ok(cb:Function):SequelizeEmitters;

    // error
    // cb(err?:Error)
    error(cb:Function):SequelizeEmitters;
    failure(cb:Function):SequelizeEmitters;
    fail(cb:Function):SequelizeEmitters;

    // done
    // cb(err?:Error)
    done(cb:Function):SequelizeEmitters;
    complete(cb:Function):SequelizeEmitters;
  }

  interface SequelizeResult {
    save():SequelizeEmitters;
    update(...args:any[]):SequelizeEmitters;
    updateAttributes(data:any,opts?:any):SequelizeEmitters;
    destroy(...args:any[]):SequelizeEmitters;
    reload():SequelizeEmitters;
    decrement(obj:any):SequelizeEmitters;
  }

  interface SequelizeModel {
    new(modelName?: string, config?: object): SequelizeModel;
    readonly tablePrefix: string;
    readonly tableName: string;
    models: object;
    sequel(name: string): SequelizeModel;

    build(obj:any):SequelizeResult;
    create(obj:any, opts?:any):SequelizeEmitters;
    bulkCreate(obj:any[]):SequelizeEmitters
    find(id:number):SequelizeEmitters;
    find(opts?:any, qopts?:any):SequelizeEmitters;
    findAll(opts?:any, qopts?:any):SequelizeEmitters;
    findOrCreate(where:any, defaults:any, opt?:any):SequelizeEmitters;
    findAndCountAll(opts:any):SequelizeEmitters;
    sync(options?:{force?:boolean}):SequelizeEmitters;
    drop():SequelizeEmitters;
    count():SequelizeEmitters;
    max(attr:string):SequelizeEmitters;
    min(attr:string):SequelizeEmitters;
    belongsTo(model:SequelizeModel);
    hasOne(model:SequelizeModel, opts?:any);
    hasMany(model:SequelizeModel, opts?:any);
    update(obj:any, where:any, opts?:any):SequelizeEmitters;
  }

  interface ModelThinkExtend {
    Sequel: SequelizeModel;
  }

  interface ModelExtend {
    sequel(name: string, config?: any, module?: string): ThinkSequelize.SequelizeModel;
  }

}

declare module 'thinkjs' {
  interface Think extends ThinkSequelize.ModelExtend, ThinkSequelize.ModelThinkExtend {}
  interface Controller extends ThinkSequelize.ModelExtend {}
  interface Context extends ThinkSequelize.ModelExtend {}
  interface Service extends ThinkSequelize.ModelExtend {}
}

export = ThinkSequelize;
