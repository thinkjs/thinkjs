const helper = require('think-helper');

module.exports = {
  ensureCsrfToken(ctx, {session_name}) {
    return ctx.session(session_name).then(value => value ? Promise.resolve(value) : ctx.session(session_name, helper.uuid(32)));
  },

  checkCsrf(ctx, {session_name, form_name, header_name}) {
    return ctx.session(session_name).then(value => {
      if (!value) return Promise.reject();

      const token = ctx.query[form_name] || ctx.request.body[form_name] || ctx.get(header_name);
      if (token !== value) return Promise.reject();
    });
  },

  assignCsrf(ctx) {
    return (value) => {
      Object.defineProperty(ctx, 'csrf', {
        get() {
          return value;
        }
      });
    }
  }
};