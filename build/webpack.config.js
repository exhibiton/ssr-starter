const webpack = require('webpack')
const cssnano = require('cssnano')
const debug = require('debug')('app:webpack:config')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')
const config = require('../server/config')
const paths = config.utils_paths

/* eslint no-underscore-dangle: ["error", { "allow": ["__DEV__", "__PROD__", "__TEST__"] }] */
const __DEV__ = config.globals.__DEV__
const __PROD__ = config.globals.__PROD__

debug('Creating configuration.')

const webpackConfig = {
  target: 'web',
  devtool: config.compiler_devtool,
  resolve: {
    modules: ['node_modules', paths.client()],
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    plugins: [
      new TsconfigPathsPlugin({
        extensions: ['.ts', '.tsx'],
        configFile: './tsconfig.json',
      }),
    ],
  },
  module: {
    rules: [],
  },
  node: {
    dns: 'mock',
    net: 'mock',
  },
  optimization: {
    noEmitOnErrors: true,
  },
}

webpackConfig.mode = __DEV__ ? 'development' : 'production' // "production" | "development" | "none"

// ------------------------------------
// Entry Points
// ------------------------------------
const APP_ENTRY = paths.client('routes/Client.tsx')

webpackConfig.entry = {
  app: __DEV__
    ? ['whatwg-fetch', APP_ENTRY].concat(
        `webpack-hot-middleware/client?path=${config.compiler_public_path}__webpack_hmr`
      )
    : ['whatwg-fetch', APP_ENTRY],
  vendor: config.compiler_vendors,
}

// ------------------------------------
// Bundle Output
// ------------------------------------
webpackConfig.output = {
  filename: `[name].[${config.compiler_hash_type}].js`,
  path: paths.dist(),
  publicPath: config.compiler_public_path,
}

// ------------------------------------
// Plugins
// ------------------------------------
webpackConfig.plugins = [
  new webpack.DefinePlugin(config.globals),
  new MiniCssExtractPlugin({
    // Options similar to the same options in webpackOptions.output
    // both options are optional
    filename: __DEV__ ? '[name].css' : '[name].[hash].css',
    chunkFilename: __DEV__ ? '[id].css' : '[id].[hash].css',
  }),
]

if (__DEV__) {
  debug('Enable plugins for live development (HMR, NoErrors).')
  webpackConfig.plugins.push(new webpack.HotModuleReplacementPlugin())
} else if (__PROD__) {
  debug('Enable plugins for production OccurenceOrder.')
  webpackConfig.plugins.push(new webpack.optimize.OccurrenceOrderPlugin())
}

// ------------------------------------
// Loaders
// ------------------------------------
// JavaScript / JSON / YAML
webpackConfig.module.rules.push(
  {
    test: /\.(ts|tsx)$/,
    exclude: /^node_modules/,
    loader: 'ts-loader',
  },
  {
    enforce: 'pre',
    test: /\.js$/,
    exclude: [/node_modules/, /dist/, /tests/],
    loader: 'source-map-loader'
  },
  {
    test: /\.(js|jsx)$/,
    exclude: /node_modules\/(?!(@hocs)\/).*/,
    loader: 'babel-loader',
    options: config.compiler_babel,
  },
  {
    test: /\.(yaml|yml)$/,
    use: ['json-loader', 'yaml-loader'],
  }
)

// ------------------------------------
// Style Loaders
// ------------------------------------
webpackConfig.module.rules.push({
  test: /\.(sa|sc|c)ss$/,
  use: [
    __DEV__ ? 'style-loader' : MiniCssExtractPlugin.loader,

    // translates CSS into CommonJS
    { loader: 'css-loader', options: { sourceMap: true } },

    // Processing url(../../) relative path
    // https://github.com/bholloway/resolve-url-loader#source-maps-required
    { loader: 'resolve-url-loader' },

    {
      loader: 'postcss-loader',
      options: {
        sourceMap: true,
        ident: 'postcss',
        plugins: [
          cssnano({
            autoprefixer: {
              add: true,
              remove: true,
              browsers: ['last 2 versions'],
            },
            discardComments: {
              removeAll: true,
            },
            discardUnused: false,
            mergeIdents: false,
            reduceIdents: false,
            safe: true,
            sourcemap: true,
          }),
        ],
      },
    },

    // compiles Sass to CSS
    { loader: 'sass-loader', options: { sourceMap: true } },
  ],
})

// ------------------------------------
// Fonts and File loaders
// ------------------------------------
webpackConfig.module.rules.push(
  {
    test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
    loader: 'file-loader',
    options: {
      name: '[name].[ext]',
      outputPath: 'fonts/',
    },
  },
  {
    test: /\.(png|jpe?g|gif)$/,
    loader: 'url-loader',
    options: {
      limit: 8192,
    },
  }
)

module.exports = webpackConfig
