import { h, Component } from 'preact'
import './App.css'
import 'preact-range-slider/assets/index.css'
import EscherContainer from './EscherContainer.js'
import { Model } from './COBRA.js'
import modelData from './E coli core.json'
import map from './E coli core.Core metabolism.json'

const buttonStyle = {
  position: 'absolute',
  right: '2%',
  bottom: '2%',
  color: 'white',
  clear: 'both',
  border: '1px solid #2E2F2F',
  backgroundImage: 'linear-gradient(#4F5151, #474949 6%, #3F4141)',
  backgroundColor: '#474949',
  borderColor: '#474949',
  lineHeight: '1.42857143',
  borderRadius: '4px',
  textAlign: 'center',
  cursor: 'pointer'
}

const pushedButton = {
  ...buttonStyle,
  backgroundImage: 'linear-gradient(#3F4141, #474949 6%, #4F5151)'
}

class App extends Component {
  componentWillMount () {
    this.setState({
      buttonStyle: buttonStyle,
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

  modelOptimize () {
    //  TODO
  }

  /**
   * Loops through the model's list of reactions until it finds the one that
   * matches the BiGG ID parameter then sets the lower and upper bounds of that
   * reaction to the bounds contained in the bounds parameter before finding the
   * new set of fluxes and setting the state of reactionData.
   * @param {number[]} bounds - A two membered list of a reaction's lower and
   * upper bounds, respectively.
   * @param {string} biggId - BiGG ID of the reaction.
   */
  sliderChange (bounds, biggId) {
    const reactions = this.state.model.reactions
    for (let i = 0, l = reactions.length; i < l; i++) {
      if (reactions[i].id === biggId) {
        reactions[i].lower_bound = bounds[0]
        reactions[i].upper_bound = bounds[1]
      }
    }
    const solution = this.state.model.optimize()
    if (solution.objectiveValue < 1e-3) {
      this.setState({ reactionData: null })
      console.log('You killed E.coli!')
    } else {
      this.setState({ reactionData: solution.fluxes })
    }
  }

  /**
   * Handles the Reset Map button press. Resets state and objective function to
   * the original model and finds the set of fluxes.
   */
  resetMap () {
    this.setState({
      model: new Model(modelData),
      currentObjective: 'Biomass_Ecoli_core_w_GAM'
    })
    const solution = this.state.model.optimize()
    if (solution.objectiveValue < 1e-3) {
      this.setState({ reactionData: null })
      console.log('You killed E.coli!')
    } else {
      this.setState({ reactionData: solution.fluxes })
    }
  }

  /**
   * Loops through the list of reactions until the reaction matching the BiGG ID
   * is found then sets the lower and upper bounds of that reaction to whatever
   * they were originally before finding the new set of fluxes and setting the
   * state of reactionData.
   * @param {string} biggId - BiGG ID of the reaction.
   */
  resetReaction (biggId) {
    const reactions = this.state.model.reactions
    const oldReactions = this.state.oldModel.reactions
    for (let i = 0, l = reactions.length; i < l; i++) {
      if (reactions[i].id === biggId) {
        reactions[i].lower_bound = oldReactions[i].lower_bound
        reactions[i].upper_bound = oldReactions[i].upper_bound
      }
    }
    const solution = this.state.model.optimize()
    if (solution.objectiveValue < 1e-3) {
      this.setState({ reactionData: null })
      console.log('You killed E.coli!')
    } else {
      this.setState({ reactionData: solution.fluxes, model: this.state.model })
    }
  }

  /**
   * Loops through the list of reactions setting all objective coefficients to 0
   * except for the one matching the given BiGG ID which it sets to 1.
   * Subsequently finds the new set of fluxes and sets the state of
   * reactionData, changes the model in state, and tracks the current objective
   * in the currentObjective state.
   * @param {string} biggId - BiGG ID of the reaction.
   */
  setObjective (biggId) {
    const reactions = this.state.model.reactions
    for (let i = 0, l = reactions.length; i < l; i++) {
      if (reactions[i].id === biggId) {
        reactions[i].objective_coefficient = 1
      } else {
        reactions[i].objective_coefficient = 0
      }
    }
    const solution = this.state.model.optimize()
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

  mouseDown (event) {
    this.setState({
      buttonStyle: pushedButton
    })
  }

  mouseUp (event) {
    this.setState({
      buttonStyle: buttonStyle
    })
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
          lowerRange={-25}
          upperRange={25}
          step={0.1}
        />
        <button
          className='resetMapButton'
          style={this.state.buttonStyle}
          onMouseDown={this.mouseDown.bind(this)}
          onMouseUp={this.mouseUp.bind(this)}
          onMouseLeave={this.mouseUp.bind(this)}
          onClick={() => this.resetMap()}
          >
          Reset Map
        </button>
      </div>
    )
  }
}

export default App
