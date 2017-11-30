declare module 'thinkjs' {
  interface Think extends ThinkEmail.EmailExtend {
  }

  interface Context extends ThinkEmail.EmailExtend {
  }

  interface Controller extends ThinkEmail.EmailExtend {
  }

  interface Service extends ThinkEmail.EmailExtend {
  }
}

declare namespace ThinkEmail {
  interface EmailExtend {
    sendEmail(transport: object, options: object): Promise<any>;
  }
}

export = ThinkEmail;
