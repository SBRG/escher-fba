/** @jsx h */
/* eslint import/no-webpack-loader-syntax: off */
import { h, Component } from 'preact'
// import 'preact/devtools'
import './App.css'
import EscherContainer from './EscherContainer.js'
import Help from './Help.js'
import * as cobra from './cobra.js'
import * as escher from 'escher'
import modelData from './data/E coli core.json'
import map from './data/E coli core.Core metabolism.json'
import CobraWorker from 'worker-loader!babel-loader!./cobra.worker.js'

const _ = escher.libs.underscore
const cobraWorker = new CobraWorker()

class App extends Component {
  constructor (props) {
    super(props)
    this.state = {
      modelData,
      model: null,
      reactionData: null,
      objectiveFlux: 0,
      helpOverlay: false,
      objectives: {},
      compoundObjectives: false
    }
    this.runThrottledOptimization = _.throttle(this.runOptimization, 200)
  }

  componentWillMount () {
    this.setState({
      model: cobra.modelFromJsonData(this.state.modelData),
      oldModel: cobra.modelFromJsonData(this.state.modelData)
    })
  }

  componentDidMount () {
    for (let reaction of this.state.model.reactions) {
      if (reaction.objective_coefficient !== 0) {
        this.setObjective(reaction.id, reaction.objective_coefficient)
      }
    }
    this.runThrottledOptimization()
  }

  loadModel (newModel) {
    if (newModel === null) {
      this.setState({
        modelData: null,
        model: null,
        oldModel: null,
        reactionData: null,
        objectiveFlux: null
      })
    }

    // load it twice so changes to model do not affect oldModel
    const model = cobra.modelFromJsonData(newModel)
    const oldModel = cobra.modelFromJsonData(newModel)
    const objectives = {}
    model.reactions.forEach(reaction => {
      if (reaction.objective_coefficient !== 0) {
        objectives[reaction.id] = reaction.objective_coefficient
      }
    })
    this.setState({
      modelData: newModel,
      model,
      oldModel,
      objectives,
      compoundObjectives: Object.keys(objectives).length > 1
    })
    this.runThrottledOptimization()
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
    // load the original model
    const model = cobra.modelFromJsonData(this.state.modelData)
    const reactions = model.reactions
    const objectives = {}
    for (let i = 0; i < reactions.length; i++) {
      const reaction = reactions[i]
      if (reaction.objective_coefficient) { // could be undefined or 0
        objectives[reaction.id] = reaction.objective_coefficient
      }
    }
    this.setState({
      model,
      objectives,
      compoundObjectives: Object.keys(objectives).length > 1
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
    const index = reactions.findIndex(x => x.id === biggId)
    let objectives = {}
    if (this.state.compoundObjectives) {
      objectives = Object.assign({}, this.state.objectives)
      if (objectives[reactions[index].id] === coefficient && Object.keys(objectives).length > 1) {
        reactions[index].objective_coefficient = 0
        delete objectives[biggId]
      } else {
        reactions[index].objective_coefficient = coefficient
        objectives[biggId] = coefficient
      }
    } else {
      for (let reaction of reactions) {
        if (reaction.id === biggId) {
          reaction.objective_coefficient = coefficient
          objectives[biggId] = coefficient
        } else {
          reaction.objective_coefficient = 0
        }
      }
    }
    this.setState(prevState => ({
      model: {
        ...prevState.model,
        reactions
      },
      objectives
    }))
    this.runThrottledOptimization()
  }

  toggleCompoundObjectives () {
    this.setState({
      compoundObjectives: !this.state.compoundObjectives
    })
    if (!this.state.compoundObjectives) {
      const model = cobra.modelFromJsonData(this.state.modelData)
      if (!model) { return }
      for (let reaction of model.reactions) {
        if (reaction.objective_coefficient !== 0) {
          this.setObjective(reaction.id, reaction.objective_coefficient)
          break
        }
      }
    }
  }

  render () {
    return (
      <div className='App'>
        <EscherContainer
          model={this.state.model}
          oldModel={this.state.oldModel}
          map={map}
          reactionData={this.state.reactionData}
          objectives={this.state.objectives}
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
            Current Flux: {Object.keys(this.state.objectives).join(', ')}
            <br />
            Flux Through Objective: {this.state.objectiveFlux}
          </div>
          <div>
            <button
              className={
                this.state.compoundObjectives
                ? 'appButton active'
                : 'appButton'
              }
              id='compound'
              onClick={() => this.toggleCompoundObjectives()}
            >
              Compound Objectives
            </button>
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
