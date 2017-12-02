declare namespace ThinkMongoose {
  interface MongooseModel {
    new(modelName?: string, config?: object): MongooseModel;
    readonly tablePrefix: string;
    readonly tableName: string;
    models: object;
    mongoose(name: string): MongooseModel;
  }

  interface ModelThinkExtend {
    Mongoose: MongooseModel;
  }

  interface ModelExtend {
    mongoose(name: string, config?: any, module?: string): ThinkMongoose.MongooseModel;
  }

}

declare module 'thinkjs' {
  interface Think extends ThinkMongoose.ModelExtend, ThinkMongoose.ModelThinkExtend {}
  interface Controller extends ThinkMongoose.ModelExtend {}
  interface Context extends ThinkMongoose.ModelExtend {}
  interface Service extends ThinkMongoose.ModelExtend {}
}

export = ThinkMongoose;
