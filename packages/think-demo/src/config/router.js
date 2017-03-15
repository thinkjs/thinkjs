module.exports = router => {
  //router.get('/test/:name', 'index/test');
  router.get(/^\/test\/(\w+)/, 'index/test?id=:1');
  //router.redirect('/eee', 'http://www.welefen.com/');
}