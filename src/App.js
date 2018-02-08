/** @jsx h */
/* eslint import/no-webpack-loader-syntax: off */
import { h, Component } from 'preact'
// import 'preact/devtools'
import './App.css'
import EscherContainer from './EscherContainer.js'
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
    const reactions = this.state.model.reactions
    let currentObjective = {}
    let reactionData = null
    let objectiveFlux = null
    let solution = null
    for (let i = 0, l = reactions.length; i < l; i++) {
      if (reactions[i].objective_coefficient === 1) {
        currentObjective.biggId = reactions[i].id
        currentObjective.coefficient = 1
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
    let currentObjective = {}
    let reactionData = null
    let objectiveFlux = null
    let solution = null
    if (model !== null) {
      const reactions = model.reactions
      for (let i = 0, l = reactions.length; i < l; i++) {
        if (reactions[i].objective_coefficient === 1) {
          currentObjective.biggId = reactions[i].id
          currentObjective.coefficient = 1
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
    if (!model) { return }
    const reactions = model.reactions
    let currentObjective = {}
    let objectiveFlux = null
    let reactionData = null
    let solution = null
    for (let i = 0, l = reactions.length; i < l; i++) {
      if (reactions[i].objective_coefficient === 1) {
        currentObjective.biggId = reactions[i].id
        currentObjective.coefficient = 1
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
   * @param {number} coefficient - Either positive or negative 1 for maximization and minimization
   */
  setObjective (biggId, coefficient) {
    const reactions = this.state.model.reactions
    let objectiveFlux = null
    let reactionData = null
    let model = null
    let solution = null
    for (let i = 0, l = reactions.length; i < l; i++) {
      if (reactions[i].id === biggId) {
        reactions[i].objective_coefficient = coefficient
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
        currentObjective: {biggId: biggId, coefficient: coefficient},
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
          </div>
        </div>
        <div
          className='helpOverlay'
          style={this.state.helpOverlay ? {display: 'block'} : {display: 'none'}}
        >
          <div className='helpBox'>
            <div className='helpContainer'>
              <h1>Welcome to Escher-FBA!</h1>
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
