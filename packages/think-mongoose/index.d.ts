import * as Mongoose from 'mongoose';

declare namespace ThinkMongoose {
  interface MongooseModel<T extends Mongoose.Document = Mongoose.Document> extends Mongoose.Model<T> {
    new(modelName?: string, config?: object): MongooseModel<T>;
    readonly tablePrefix: string;
    readonly tableName: string;
    models: object;
    mongoose<T extends Mongoose.Document, U extends MongooseModel<T>>(name: string): U;
  }

  interface MongooseModelDefinition {
    new(): MongooseModelDefinition;
    readonly schema: Mongoose.SchemaDefinition | Mongoose.Schema;
  }

  interface ModelThinkExtend {
    Mongoose: MongooseModelDefinition;
  }

  interface ModelExtend {
    mongoose(name: string, config?: any, module?: string): ThinkMongoose.MongooseModel;
  }
}

declare module 'thinkjs' {
  interface Think extends ThinkMongoose.ModelExtend, ThinkMongoose.ModelThinkExtend { }
  interface Controller extends ThinkMongoose.ModelExtend { }
  interface Context extends ThinkMongoose.ModelExtend { }
  interface Service extends ThinkMongoose.ModelExtend { }
}

export = ThinkMongoose;
