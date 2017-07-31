import { h, Component } from 'preact'
import logo from './logo.svg'
import './App.css'
import 'preact-range-slider/assets/index.css'
import { MultiSlider } from 'preact-range-slider'
import EscherContainer from './EscherContainer.js'
import FBA from './FBA.js'
import model from './E coli core.json'

class App extends Component {
  componentDidMount () {
    const fba = new FBA()
    var result = fba.build_and_solve (model)
    if (result.f < 1e-3) {
      this.setState ({ reaction_data: null })
      console.log ('You killed E.coli!')
    } else {
      this.setState ({ reaction_data: result.x })
    }
  }
  render () {
    console.log('Rendering')
    return (
      <div className="App">
         <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Hello World</h2>
        </div>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
        <EscherContainer reaction_data={ this.state.reaction_data } />
        <div className="Slider">
         <MultiSlider
          min={ -10 }
          max={ 1000 }
          defaultValue={ [0, 50] }
          tipFormatter={ f => f === -10 ? 'hi' : f}
          // allowCross={ false }
          // pushable={ 1 }
          //onAfterChange={(value)=>[min, max]}
        />
      </div>
      </div>
    )
  }
}

export default App