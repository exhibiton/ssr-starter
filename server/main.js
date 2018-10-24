const express = require('express')
const debug = require('debug')('app:server')
const webpack = require('webpack')
const webpackConfig = require('../build/webpack.config')
const config = require('./config')

const app = express()
const paths = config.utils_paths

// ------------------------------------
// Apply Webpack HMR Middleware
// ------------------------------------
if (config.env === 'development') {
  const compiler = webpack(webpackConfig)

  debug('Enable webpack dev and HMR middleware')
  app.use(require('webpack-dev-middleware')(compiler, {
    publicPath: webpackConfig.output.publicPath,
    contentBase: paths.client(),
    hot: true,
    quiet: config.compiler_quiet,
    noInfo: config.compiler_quiet,
    lazy: false,
    stats: config.compiler_stats
  }))
  app.use(require('webpack-hot-middleware')(compiler))

  // Serve static assets from ~/src/static since Webpack is unaware of
  // these files. This middleware doesn't need to be enabled outside
  // of development since this directory will be copied into ~/dist
  // when the application is compiled.
  app.use(express.static(paths.client('static')))

  // Run additional HTTPS server with ENV param HTTPS_PORT
  // `PORT=3001 HTTPS_PORT=3002 yarn start`
  // you may need to generate ssl keys:
  // $ mkdir .ssl
  // $ openssl req -new -newkey rsa:2048 -sha1 -days 365 -nodes -x509 -keyout .ssl/localhost.key -out .ssl/localhost.crt
  if (config.https_server_port) {
    const fs = require('fs')
    const https = require('https')
    // eslint-disable-next-line no-sync
    const privateKey = fs.readFileSync('.ssl/localhost.key', 'utf8')
    // eslint-disable-next-line no-sync
    const certificate = fs.readFileSync('.ssl/localhost.crt', 'utf8')
    const credentials = { key: privateKey, cert: certificate }
    const httpsServer = https.createServer(credentials, app)

    httpsServer.listen(config.https_server_port)
    debug(`HTTPS Server is now running at https://${config.server_host}:${config.https_server_port}`)
  }
} else {
  debug(
    'Server is being run outside of live development mode, meaning it will ' +
    'only serve the compiled application bundle in ~/dist. Generally you ' +
    'do not need an application server for this and can instead use a web ' +
    'server such as nginx to serve your static files. See the "deployment" ' +
    'section in the README for more information on deployment strategies.'
  )

  // Serving ~/dist by default. Ideally these files should be served by
  // the web server and not the app server, but this helps to demo the
  // server in production.
  app.use(express.static(paths.dist()))
}


module.exports = app
