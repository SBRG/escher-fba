import { h, Component } from 'preact'
import './App.css'
import 'preact-range-slider/assets/index.css'
import EscherContainer from './EscherContainer.js'
import { Model } from './COBRA.js'
import modelData from './E coli core.json'
import map from './E coli core.Core metabolism.json'

const buttonStyle = {
  'position': 'absolute',
  'right': '2%',
  'bottom': '2%',
  'color': 'black'
}

class App extends Component {
  componentWillMount () {
    this.setState({ 
      model: new Model(modelData), 
      oldModel: new Model(modelData),
      currentObjective: 'Biomass_Ecoli_core_w_GAM'
    })
  }
  
  componentDidMount () {    
    let solution = this.state.model.optimize()
    if (solution.objectiveValue < 1e-3) {
      this.setState({ reactionData: null })
      console.log('You killed E.coli!')
    } else {
      this.setState({ reactionData: solution.fluxes })
    }
  }

  sliderChange (bounds, biggId) {
    let reactions = this.state.model.reactions
    for (let i = 0, l = reactions.length; i < l; i++) {
      if (reactions[i].id === biggId) {
        reactions[i].lower_bound = bounds[0]
        reactions[i].upper_bound = bounds[1]
      }
    }
    let solution = this.state.model.optimize()
    if (solution.objectiveValue < 1e-3) {
      this.setState({ reactionData: null })
      console.log('You killed E.coli!')
    } else {
      this.setState({ reactionData: solution.fluxes })
    }
  }

  resetMap () {
    this.setState({
      model: new Model(modelData),
      currentObjective: 'Biomass_Ecoli_core_w_GAM'
    })
    let solution = this.state.model.optimize()
    if (solution.objectiveValue < 1e-3) {
      this.setState({ reactionData: null })
      console.log('You killed E.coli!')
    } else {
      this.setState({ reactionData: solution.fluxes })
    }
  }

  resetReaction (biggId) {
    const reactions = this.state.model.reactions
    const oldReactions = this.state.oldModel.reactions
    for (let i = 0, l = reactions.length; i < l; i++) {
      if (reactions[i].id === biggId) {
        reactions[i].lower_bound = oldReactions[i].lower_bound
        reactions[i].upper_bound = oldReactions[i].upper_bound
      }
    }
    let solution = this.state.model.optimize()
    if (solution.objectiveValue < 1e-3) {
      this.setState({ reactionData: null })
      console.log('You killed E.coli!')
    } else {
      this.setState({ reactionData: solution.fluxes, model: this.state.model })
    }
  }

  setObjective (biggId) {
    const reactions = this.state.model.reactions
    for (let i = 0, l = reactions.length; i < l; i++) {
      if (reactions[i].id === biggId) {
        reactions[i].objective_coefficient = 1
      } else {
        reactions[i].objective_coefficient = 0
      }
    }
    let solution = this.state.model.optimize()
    if (solution.objectiveValue < 1e-3) {
      this.setState({ reactionData: null })
      console.log('You killed E.coli!')
    } else {
      this.setState({ 
        reactionData: solution.fluxes, 
        model: this.state.model,
        currentObjective: biggId
      })
    }
  }

  render () {
    //  console.log('Rendering')
    return (
      <div className='App'>
        <EscherContainer
          model={this.state.model}
          oldModel={this.state.oldModel}
          map={map}
          reactionData={this.state.reactionData}
          currentObjective={this.state.currentObjective}
          sliderChange={(bounds, biggId) => this.sliderChange(bounds, biggId)}
          resetReaction={(biggId) => this.resetReaction(biggId)}
          setObjective={(biggId) => this.setObjective(biggId)}
        />
        <button 
          className='resetMapButton' 
          style={buttonStyle}
          onClick={() => this.resetMap()}
          >
          Reset Map
        </button>
      </div>
    )
  }
}

export default App
