const isDev = think.env === 'development';
module.exports = {
  type: 'mysql',
  common: {
    logConnect: isDev,
    logSql: isDev,
    logger: msg => {
      think.isError(msg) ?  think.logger.error(msg) :  think.logger.info(msg);
    }
  },
  mongoose: {
    host: '127.0.0.1',
    port: 27017,
    database: 'test',
    prefix: 'test_'
  },
  mysql: {
    database: 'firekylin13',
    prefix: 'fk_',
    encoding: 'utf8',
    nums_per_page: 10,
    host: '127.0.0.1',
    port: '',
    user: 'root',
    password: 'root'
  }
};