/** @jsx h */
/* eslint import/no-webpack-loader-syntax: off */
import { h, Component } from 'preact'
// import 'preact/devtools'
import './App.css'
import 'preact-range-slider/assets/index.css'
import EscherContainer from './EscherContainer.js'
import * as COBRA from './COBRA.js'
import * as escher from 'escher-vis'
import modelData from './E coli core.json'
import map from './E coli core.Core metabolism.json'
import COBRAWorker from 'worker-loader!babel-loader!./COBRA.worker.js'

const _ = escher.libs.underscore
const cobraWorker = new COBRAWorker()

class App extends Component {
  constructor (props) {
    super(props)
    this.state = {
      modelData,
      model: null,
      reactionData: null,
      objectiveFlux: 0
    }
    this.runThrottledOptimization = _.throttle(this.runOptimization, 200)
  }

  componentWillMount () {
    this.setState({
      model: COBRA.modelFromJsonData(this.state.modelData),
      oldModel: COBRA.modelFromJsonData(this.state.modelData)
    })
  }

  componentDidMount () {
    const reactions = this.state.model.reactions
    let currentObjective = null
    let reactionData = null
    let objectiveFlux = null
    let solution = null
    for (let i = 0, l = reactions.length; i < l; i++) {
      if (reactions[i].objective_coefficient === 1) {
        currentObjective = reactions[i].id
      }
    }
    cobraWorker.postMessage(this.state.model)
    cobraWorker.onmessage = (message) => {
      solution = message.data
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
  }

  loadModel (newModel) {
    const model = COBRA.modelFromJsonData(newModel)
    const oldModel = COBRA.modelFromJsonData(newModel)
    let currentObjective = null
    let reactionData = null
    let objectiveFlux = null
    let solution = null
    if (model !== null) {
      const reactions = model.reactions
      for (let i = 0, l = reactions.length; i < l; i++) {
        if (reactions[i].objective_coefficient === 1) {
          currentObjective = reactions[i].id
        }
      }
      cobraWorker.postMessage(model)
      cobraWorker.onmessage = (message) => {
        solution = message.data
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
    } else {
      this.setState({
        modelData: newModel,
        model,
        oldModel,
        currentObjective,
        reactionData,
        objectiveFlux
      })
    }
  }

  runOptimization (reactionData, objectiveFlux) {
    let solution = null
    cobraWorker.postMessage(this.state.model)
    cobraWorker.onmessage = (message) => {
      solution = message.data
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
    const model = COBRA.modelFromJsonData(this.state.modelData)
    const reactions = model.reactions
    let currentObjective = null
    let objectiveFlux = null
    let reactionData = null
    let solution = null
    for (let i = 0, l = reactions.length; i < l; i++) {
      if (reactions[i].objective_coefficient === 1) {
        currentObjective = reactions[i].id
      }
    }
    // instead call runOptimization
    cobraWorker.postMessage(model)
    cobraWorker.onmessage = (message) => {
      solution = message.data
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
    let solution = null
    for (let i = 0, l = reactions.length; i < l; i++) {
      if (reactions[i].id === biggId) {
        reactions[i].objective_coefficient = 1
      } else {
        reactions[i].objective_coefficient = 0
      }
    }
    cobraWorker.postMessage(this.state.model)
    cobraWorker.onmessage = (message) => {
      solution = message.data
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
          <div className='statusBar'>
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