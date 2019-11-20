interface ThinkEmailCtx {
  sendEmail(transport: object, options: object): Promise<any>;
}

declare module 'thinkjs' {
  interface Think extends ThinkEmailCtx {
  }

  interface Context extends ThinkEmailCtx {
  }

  interface Controller extends ThinkEmailCtx {
  }

  interface Service extends ThinkEmailCtx {
  }
}

declare namespace ThinkEmail {
  const think: ThinkEmailCtx
  const controller: ThinkEmailCtx
  const context: ThinkEmailCtx
}

export = ThinkEmail;
