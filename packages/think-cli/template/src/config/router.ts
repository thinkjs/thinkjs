module.exports = router => {
  //router.get('/test/:name', 'index/test');
  router.get(/^\/test\/(\w+)/, 'index/test?id=:1');
  router.get('/i18n', 'index');
  //router.redirect('/eee', 'http://www.welefen.com/');
}