// Home is default root route component
import Home from './Home'
// App is the AppLayout that renders topnav etc, content that is always visible
import App from './App'

export default[
  {
    ...App,
    routes : [
      {
        ...Home,
        path: '/',
        exact: true,
      },
    ],
  },
]
