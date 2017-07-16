const helper = require('think-helper');

module.exports = {
  ensureCsrfToken(ctx, {session_name}) {
    const token = helper.uuid(32);
    return ctx.session(session_name).then(value => value ? Promise.resolve(value) : ctx.session(session_name, token).then(() => token));
  },

  checkCsrf(ctx, {session_name, form_name, header_name}) {
    return ctx.session(session_name).then(value => {
      if (!value) throw new Error('Verification failed');

      const token = ctx.query[form_name] || ctx.request.body[form_name] || ctx.get(header_name);
      if (token !== value) throw new Error('Verification failed');
    });
  },

  assignCsrf(ctx) {
    return (value) => {
      Object.defineProperty(ctx, 'csrf', {
        get() {
          return value;
        }
      });
    };
  }
};
