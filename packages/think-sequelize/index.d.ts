declare namespace ThinkSequelize {

  interface Model {
    new(modelName?: string, config?: object): Model;
    readonly tablePrefix: string;
    models: object;
    sequel(name: string): Model;
  }

  interface ModelThinkExtend {
    Model: Model;
  }

  interface ModelExtend {
    model(name: string, config?: any, module?: string): ThinkSequelize.Model;
  }

}

declare module 'thinkjs' {
  interface Think extends ThinkSequelize.ModelExtend, ThinkSequelize.ModelThinkExtend {}
  interface Controller extends ThinkSequelize.ModelExtend {}
  interface Context extends ThinkSequelize.ModelExtend {}
  interface Service extends ThinkSequelize.ModelExtend {}
}

export = ThinkSequelize;
