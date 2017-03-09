const env = process.env;
const pm2KeyList = [
  'PM2_USAGE',
  'PM2_SILENT',
  'PM2_INTERACTOR_PROCESSING',
  'PM2_HOME',
  'PM2_JSON_PROCESSING'
];
const inPM2 = pm2KeyList.some(item => {
  return !!env[item];
});
const clusterMode = env.exec_mode === 'cluster_mode';

exports.inPM2 = inPM2;
exports.isClusterMode = clusterMode;