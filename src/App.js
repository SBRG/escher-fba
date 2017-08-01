import { h, Component } from 'preact'
import logo from './logo.svg'
import './App.css'
import 'preact-range-slider/assets/index.css'
//import { MultiSlider } from 'preact-range-slider'
import EscherContainer from './EscherContainer.js'
import { Model } from './COBRA.js'
import model_data from './E coli core.json'

class App extends Component {
  componentDidMount () {
    this.setState({ model: new Model(model_data) })
    var solution = this.state.model.optimize()
    if (solution.objectiveValue < 1e-3) {
      this.setState({ reaction_data: null })
      console.log ('You killed E.coli!')
    } else {
      this.setState({ reaction_data: solution.fluxes })
    }
    console.log(this.state.model.reactions[20].id)
  }

  sliderChange (bounds, biggId) {
    const reactions = this.state.model.reactions
    for (let i = 0, l = reactions.length; i < l; i++) {
      if (reactions[i].id === biggId) {
        reactions[i].lower_bound = bounds[0]
        reactions[i].upper_bound = bounds[1]
      }
    }
    var solution = this.state.model.optimize()
    if (solution.objectiveValue < 1e-3) {
      this.setState({ reaction_data: null })
      console.log ('You killed E.coli!')
    } else {
      this.setState({ reaction_data: solution.fluxes })
    }
  }

  render () {
    //console.log('Rendering')
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Hello World</h2>
        </div>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
        <EscherContainer 
        reaction_data={ this.state.reaction_data }
        sliderChange={ (bounds, biggId) => this.sliderChange(bounds, biggId) }
        />
        {/* <div className="Slider">
          <MultiSlider
          min={ 0 }
          max={ 52 }
          defaultValue={ [0, 52] }
          tipFormatter={ f => f === 0 ? -1000 : f === 52 ? 1000 : f - 26 }
          // allowCross={ false }
          // pushable={ 1 }
          //onAfterChange={(value)=>[min, max]}
          /> 
        </div> */}
      </div>
    )
  }
}

export default App