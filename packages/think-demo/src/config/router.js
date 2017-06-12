module.exports = [
  [/\/user/, 'user', 'rest'],
  ['/test/:name', '/testwww', 'redirect'],
  ['/post/:id/comments/:cid?', 'comment', 'rest'],
  [ /^\/article\/list\/(\w+)/, 'article/:1']
];
