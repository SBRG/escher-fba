import { h, render } from 'preact'
import Router from 'preact-router'
import createHashHistory from 'history/createHashHistory'
import App from './App'
import Homepage from './Homepage'
import registerServiceWorker from './registerServiceWorker'
import './index.css'
/** @jsx h */

const Main = () => (
  <Router history={createHashHistory()}>
    <Home path='/' />
    <Application path='/app' />
  </Router>
)

const Home = () => (
  <Homepage />
)

const Application = () => (
  <App />
)

render(<Main />, document.getElementById('root'))
registerServiceWorker()
