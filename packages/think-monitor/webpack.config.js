var path = require('path');
var args = require('minimist')(process.argv.slice(2));
var webpack = require('webpack');
var _ = require('lodash');
var allowedEnvs = [
  'dev',
  'dist'
];
var env = args.env;
if (allowedEnvs.indexOf(env) === -1) {
  env = 'dev';
}
process.env.REACT_WEBPACK_ENV = env;
var entryDir = path.join(__dirname, '/web/app');
var base = {
  entry: { monitor: entryDir + '/monitor' },
  output: {
    path: 'web/build',
    filename: '[name].js',
    chunkFilename: '[id].chunk.js',
    publicPath: '/web/build/'
  },
  resolve: {
    extensions: [
      '',
      '.js',
      '.jsx'
    ],
    alias: {
      components: entryDir + '/components',
      monitor: entryDir + '/monitor'
    }
  },
  module: {
    preLoaders: [{
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: 'eslint-loader'
      }],
    loaders: [
      {
        test: /\.(js|jsx)$/,
        loader: 'babel-loader',
        include: entryDir,
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader!postcss-loader'
      },
      {
        test: /\.sass/,
        loader: 'style-loader!css-loader!sass-loader'
      },
      {
        test: /\.scss/,
        loader: 'style-loader!css-loader!sass-loader'
      },
      {
        test: /\.less/,
        loader: 'style-loader!css-loader!less-loader'
      },
      {
        test: /\.styl/,
        loader: 'style-loader!css-loader!stylus-loader'
      },
      {
        test: /\.(png|jpg|gif|ttf|eot|svg|woff|woff2)$/,
        loader: 'url-loader?name=[path][name].[ext]&limit=200000'
      },
      {
        test: /environment\.bin?$/,
        loader: 'imports-loader?environment=>"' + env + '"',
        exclude: /node_modules/
      }
    ]
  },
  postcss: function () {
    return [];
  },
  plugins: [],
  devServer: {
    port: 8361,
    index: 'monitor.html',
    historyApiFallback: {
      rewrites: [{
          from: /\/monitor/,
          to: '/monitor.html'
        }]
    }
  }
};
var configs = {};
configs.dev = _.merge({
  cache: true,
  devtool: 'inline-source-map'
}, base);
configs.dist = _.merge({
  cache: false,
  devtool: 'sourcemap',
  plugins: [
    new webpack.optimize.UglifyJsPlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.AggressiveMergingPlugin(),
    new webpack.NoErrorsPlugin()
  ]
}, base);
module.exports = configs[env];