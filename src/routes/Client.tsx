// Startup point for the client side application
import 'babel-polyfill'
import React from 'react'
import ReactDOM from 'react-dom'
import Routes from './Routes'
import { BrowserRouter } from 'react-router-dom'
import { renderRoutes } from 'react-router-config'


ReactDOM.hydrate(
    <BrowserRouter>
      <div>{renderRoutes(Routes)}</div>
    </BrowserRouter>,
  document.querySelector('#root'),
)