import { h, render } from 'preact'
import Router from 'preact-router'
import createHashHistory from 'history/createHashHistory'
import App from './App'
import registerServiceWorker from './registerServiceWorker'
import './index.css'
import logo from './escher-logo.png'
import screenshot from './Screen.png'
/** @jsx h */

const Main = () => (
  <Router history={createHashHistory()}>
    <Home path='/' />
    <Application path='/app' />
  </Router>
)

const Home = () => (
  <div className='splashPage'>
    <div id='titleBar'>
      <img src={logo} alt='' width='250' />
      <div id='titleBox'>
        <h1 id='title'>ESCHER-FBA</h1>
      </div>
    </div>
    <h3>Escher-FBA is a convenient visualization tool for flux balance analysis built as an add-on to Escher.</h3>
    <p>Try it out by mousing over a reaction label and using the buttons within the tooltip! The upper and lower bounds can also be changed by adjusting the slider bars or by entering values in the Upper Bound and Lower Bound fields</p>
    <br />
    <p>
      {`The `}
      <button className='demoButton'>
        Knockout
      </button>
      {` button sets both the upper and lower bounds of the reaction to zero, simulating a knockout of the targeted gene`}
    </p>
    <p>
      {`The `}
      <button className='demoButton'>
      Reset
      </button>
      {` button resets the upper and lower bounds of the reaction to their original values in the loaded model`}
    </p>
    <p>
      {`The `}
      <button className='demoButton'>
      Maximize
      </button>
      {` button tells the problem solver to set the objective function to maximize the amount of flux through the target reaction`}
    </p>
    <p>
      {`The opposite of the maximize button, the `}
      <button className='demoButton'>
      Minimize
      </button>
      {` button sets the objective function to minimize the amount of flux through the target reaction`}
    </p>
    <p><b>Click the image below to go to the application</b></p>
    <a href='/app'><img src={screenshot} alt='' width='300' /></a>
  </div>
)

const Application = () => (
  <App />
)

render(<Main />, document.getElementById('root'))
registerServiceWorker()
