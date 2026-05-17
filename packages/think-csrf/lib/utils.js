const helper = require('think-helper');

module.exports = {
  ensureCsrfToken(ctx, {session_name}) {
    const token = helper.uuid(32);
    return ctx
      .session(session_name)
      .then(value => value
        ? Promise.resolve(value)
        : ctx.session(session_name, token)
          .then(() => token)
      );
  },

  checkCsrf(ctx, {session_name, form_name, header_name, errno, errmsg}) {
    return ctx.session(session_name).then(value => {
      if (!value) ctx.throw(errno, errmsg);

      const token = ctx.query[form_name] || (ctx.request.body.post && ctx.request.body.post[form_name]) || ctx.get(header_name);
      if (token !== value) ctx.throw(errno, errmsg);
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
