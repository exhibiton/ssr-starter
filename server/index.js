import 'babel-polyfill'
import express from 'express'
import {
  matchRoutes
} from 'react-router-config'
import Routes from '../src/routes/Routes'
import serverEntry from '../src/index'

const app = express()

app.use(express.static('public'))
// app.get('*', (req, res) => {
//   console.log(matchRoutes(Routes, req.path))

//   res.send(serverEntry(req))
// })

app.get('*', (req, res) => {
  const promises = matchRoutes(Routes, req.path).map(({
    route
  }) => route.loadData ? route.loadData() : null).map(promise => {
    if (promise) {
      return new Promise((resolve, reject) => {
        promise.then(resolve).catch(resolve)
      })
    }
    return null
  })

  Promise.all(promises).then(() => {
    const context = {}
    const content = serverEntry(req, context)

    if (context.url) {
      return res.redirect(301, context.url)
    }
    if (context.notFound) {
      res.status(404)
    }

    res.send(content)
  })
})

app.listen(3000, () => {
  console.log('Listening on port 3000')
})
