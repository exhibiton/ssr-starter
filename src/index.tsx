import React from 'react'
import {StaticRouter} from 'react-router-dom'
import {renderRoutes} from 'react-router-config'
import {renderToString} from 'react-dom/server'
import Routes from './routes/Routes'

export default (req, context) => {
  const content = renderToString(
    <StaticRouter location={req.path} context={context}>
      <div>{renderRoutes(Routes)}</div>
    </StaticRouter>,
  )

  return `
    <html>
      <body>
        <div id="root">${content}</div>
        <script src="bundle.js"></script>
      </body>
    </html>
  `
}
