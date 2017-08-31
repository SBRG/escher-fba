/** @jsx h */
import { h, Component } from 'preact'
import './App.css'
import 'preact-range-slider/assets/index.css'
import EscherContainer from './EscherContainer.js'
import { Model } from './COBRA.js'
import * as escher from 'escher-vis'
import modelData from './E coli core.json'
import map from './E coli core.Core metabolism.json'

const _ = escher.libs.underscore

class App extends Component {
  constructor (props) {
    super(props)
    this.state = {
      modelData,
      reactionData: null,
      objectiveFlux: 0
    }
    this.runThrottledOptimization = _.throttle(this.runOptimization, 10)
  }

  componentWillMount () {
    this.setState({
      model: new Model(this.state.modelData),
      oldModel: new Model(this.state.modelData)
    })
  }

  componentDidMount () {
    const reactions = this.state.model.reactions
    let currentObjective = null
    let reactionData = null
    let objectiveFlux = null
    for (let i = 0, l = reactions.length; i < l; i++) {
      if (reactions[i].objective_coefficient === 1) {
        currentObjective = reactions[i].id
      }
    }
    let solution = this.state.model.optimize()
    if (solution.objectiveValue === null) {
      reactionData = null
      objectiveFlux = 'Infeasible solution/Dead cell'
    } else {
      reactionData = solution.fluxes
      objectiveFlux = solution.objectiveValue.toFixed(3)
    }
    this.setState({
      currentObjective,
      reactionData,
      objectiveFlux
    })
  }

  loadModel (newModel) {
    const model = new Model(newModel)
    const oldModel = new Model(newModel)
    const reactions = model.reactions
    let currentObjective = null
    let reactionData = null
    let objectiveFlux = null
    for (let i = 0, l = reactions.length; i < l; i++) {
      if (reactions[i].objective_coefficient === 1) {
        currentObjective = reactions[i].id
      }
    }
    let solution = model.optimize()
    if (solution.objectiveValue === null) {
      reactionData = null
      objectiveFlux = 'Infeasible solution/Dead cell'
    } else {
      reactionData = solution.fluxes
      objectiveFlux = solution.objectiveValue.toFixed(3)
    }
    this.setState({
      modelData: newModel,
      model,
      oldModel,
      currentObjective,
      reactionData,
      objectiveFlux
    })
  }

  runOptimization (reactionData, objectiveFlux) {
    const solution = this.state.model.optimize()
    if (solution.objectiveValue === null) {
      reactionData = null
      objectiveFlux = 'Infeasible solution/Dead cell'
    } else {
      reactionData = solution.fluxes
      objectiveFlux = solution.objectiveValue.toFixed(3)
    }
    this.setState({
      reactionData,
      objectiveFlux
    })
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
    let reactionData = null
    let objectiveFlux = null
    for (let i = 0, l = reactions.length; i < l; i++) {
      if (reactions[i].id === biggId) {
        reactions[i].lower_bound = bounds[0]
        reactions[i].upper_bound = bounds[1]
      }
    }
    this.runThrottledOptimization(reactionData, objectiveFlux)
  }

  /**
   * Handles the Reset Map button press. Resets state and objective function to
   * the original model and finds the set of fluxes.
   */
  resetMap () {
    const model = new Model(this.state.modelData)
    const reactions = model.reactions
    let currentObjective = null
    let objectiveFlux = null
    let reactionData = null
    for (let i = 0, l = reactions.length; i < l; i++) {
      if (reactions[i].objective_coefficient === 1) {
        currentObjective = reactions[i].id
      }
    }
    // instead call runOptimization
    const solution = model.optimize()
    if (solution.objectiveValue === null) {
      reactionData = null
      objectiveFlux = 'Infeasible solution/Dead cell'
    } else {
      reactionData = solution.fluxes
      objectiveFlux = solution.objectiveValue.toFixed(3)
    }
    this.setState({
      model,
      currentObjective,
      reactionData,
      objectiveFlux
    })
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
    let objectiveFlux = null
    let reactionData = null
    let model = null
    for (let i = 0, l = reactions.length; i < l; i++) {
      if (reactions[i].id === biggId) {
        reactions[i].objective_coefficient = 1
      } else {
        reactions[i].objective_coefficient = 0
      }
    }
    const solution = this.state.model.optimize()
    if (solution.objectiveValue === null) {
      reactionData = null
      model = this.state.model
      objectiveFlux = 'Infeasible solution/Dead cell'
    } else {
      reactionData = solution.fluxes
      model = this.state.model
      objectiveFlux = solution.objectiveValue.toFixed(3)
    }
    this.setState({
      reactionData,
      model,
      currentObjective: biggId,
      objectiveFlux
    })
  }

  render () {
    // console.log(window.screen.availWidth)
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
          loadModel={(newModel) => this.loadModel(newModel)}
          lowerRange={-25}
          upperRange={25}
          step={0.1}
        />
        <div className='bottomPanel'>
          <div
            className='statusBar'
            style={{
              height: '45px',
              color: 'red',
              backgroundColor: 'white',
              fontSize: '16px'
            }}
            >
            Current Flux: {this.state.currentObjective}
            <br />
            Flux Through Objective: {this.state.objectiveFlux}
          </div>
          <button
            className='resetMapButton'
            onClick={() => this.resetMap()}
            >
            Reset Map
          </button>
        </div>
      </div>
    )
  }
}

export default App
