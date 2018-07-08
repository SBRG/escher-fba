/** @jsx h */
/* eslint import/no-webpack-loader-syntax: off */
import { h, Component } from 'preact'
// import 'preact/devtools'
import './App.css'
import EscherContainer from './EscherContainer.js'
import Help from './Help.js'
import * as COBRA from './COBRA.js'
import * as escher from 'escher'
import modelData from './data/E coli core.json'
import map from './data/E coli core.Core metabolism.json'
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
      objectiveFlux: 0,
      helpOverlay: false
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
    const reactions = [...this.state.model.reactions]
    let currentObjective = {}
    for (let i = 0, l = reactions.length; i < l; i++) {
      if (reactions[i].objective_coefficient === 1) {
        currentObjective.biggId = reactions[i].id
        currentObjective.coefficient = 1
        break
      }
    }
    this.setState(prevState => ({
      model: {
        ...prevState.model,
        reactions
      },
      currentObjective
    }))
    this.runThrottledOptimization()
  }

  loadModel (newModel) {
    const model = COBRA.modelFromJsonData(newModel)
    const oldModel = COBRA.modelFromJsonData(newModel)
    let currentObjective = {}
    if (model !== null) {
      const reactions = model.reactions
      for (let i = 0; i < reactions.length; i++) {
        if (reactions[i].objective_coefficient === 1) {
          currentObjective.biggId = reactions[i].id
          currentObjective.coefficient = 1
          break
        }
      }
      this.setState({
        modelData: newModel,
        model,
        oldModel,
        currentObjective
      })
      this.runThrottledOptimization()
    } else {
      this.setState({
        modelData: newModel,
        model,
        oldModel,
        currentObjective,
        reactionData: null,
        objectiveFlux: null
      })
    }
  }

  /**
   * Solves the new model parameters and updates reactionData and objectiveFlux to reflect
   * the changes.
   */
  runOptimization () {
    let reactionData = null
    let objectiveFlux = 'Infeasible solution/Dead cell'
    cobraWorker.postMessage(this.state.model)
    cobraWorker.onmessage = (message) => {
      const solution = message.data
      if (solution.objectiveValue !== null) {
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
   * @param {number[]} bounds - A two membered array of a reaction's lower and
   * upper bounds, respectively.
   * @param {string} biggId - BiGG ID of the reaction.
   */
  sliderChange (bounds, biggId) {
    const reactions = [...this.state.model.reactions]
    for (let i = 0; i < reactions.length; i++) {
      if (reactions[i].id === biggId) {
        reactions[i].lower_bound = bounds[0]
        reactions[i].upper_bound = bounds[1]
        this.setState(prevState => ({
          model: {
            ...prevState.model,
            reactions
          }
        }))
        break
      }
    }
    this.runThrottledOptimization()
  }

  /**
   * Handles the Reset Map button press. Resets state and objective function to
   * the original model and finds the set of fluxes.
   */
  resetMap () {
    const model = COBRA.modelFromJsonData(this.state.modelData)
    if (!model) { return }
    const reactions = model.reactions
    let currentObjective = {}
    for (let i = 0, l = reactions.length; i < l; i++) {
      if (reactions[i].objective_coefficient === 1) {
        currentObjective.biggId = reactions[i].id
        currentObjective.coefficient = 1
      }
      break
    }
    this.setState({
      model,
      currentObjective
    })
    this.runThrottledOptimization()
  }

  /**
   * Loops through the list of reactions setting all objective coefficients to 0
   * except for the one matching the given BiGG ID which it sets to 1.
   * Subsequently finds the new set of fluxes and sets the state of
   * reactionData, changes the model in state, and tracks the current objective
   * in the currentObjective state.
   * @param {string} biggId - BiGG ID of the reaction.
   * @param {number} coefficient - Either positive or negative 1 for maximization and minimization
   */
  setObjective (biggId, coefficient) {
    const reactions = [...this.state.model.reactions]
    for (let i = 0; i < reactions.length; i++) {
      if (reactions[i].id === biggId) {
        reactions[i].objective_coefficient = coefficient
      } else {
        reactions[i].objective_coefficient = 0
      }
    }
    this.setState(prevState => ({
      model: {
        ...prevState.model,
        reactions
      },
      currentObjective: {biggId: biggId, coefficient: coefficient}
    }))
    this.runThrottledOptimization()
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
          setObjective={(biggId, coefficient) => this.setObjective(biggId, coefficient)}
          loadModel={(newModel) => this.loadModel(newModel)}
          lowerRange={-25}
          upperRange={25}
          step={0.01}
        />
        <div className='bottomPanel'>
          <div className='statusBar'>
            Current Flux: {this.state.currentObjective
              ? this.state.currentObjective.biggId
              : ''
            }
            <br />
            Flux Through Objective: {this.state.objectiveFlux}
          </div>
          <div>
            <button
              className='appButton'
              id='reset'
              onClick={() => this.resetMap()}
              >
              Reset Map
            </button>
            <button
              className='appButton'
              id='help'
              onClick={() => this.setState({helpOverlay: true})}
              >
              Help
            </button>
            <a href='/' className='appButton' id='home'>
              Home
            </a>
          </div>
        </div>
        <div
          className='helpOverlay'
          style={this.state.helpOverlay ? {display: 'block'} : {display: 'none'}}
        >
          <div className='helpBox'>
            <div className='helpContainer'>
              <Help />
            </div>
            <button
              className='appButton'
              id='close'
              onClick={() => this.setState({helpOverlay: false})}
            >
            Close
            </button>
          </div>
        </div>
      </div>
    )
  }
}

export default App
