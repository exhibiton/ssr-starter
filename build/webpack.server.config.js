const path = require('path');
const webpackNodeExternals = require('webpack-node-externals');

module.exports = {
  // Inform webpack that we're building a bundle
  // for nodeJS, rather than for the browser
  target: 'node',

  // Tell webpack the root file of our
  // server application
  entry: './server/index.js',

  // Tell webpack where to put the output file
  // that is generated
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname)
  },

  externals: [webpackNodeExternals()],
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  // Tell webpack to run babel on every file it runs through
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.(ts|tsx|js|jsx)$/,
        exclude: /^node_modules/,
        loader: 'ts-loader',
      },
      {
        test: /\.(yaml|yml)$/,
        use: ['json-loader', 'yaml-loader'],
      }
    ]
  }
};
