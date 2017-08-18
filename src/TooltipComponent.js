import { h, Component } from 'preact'
import { MultiSlider } from 'preact-range-slider'
import 'preact-range-slider/assets/index.css'
import * as escher from 'escher-vis'
const _ = escher.libs.underscore

const WIDTH = 500
const HEIGHT = 185
// or: import { WIDTH } from './constants'

const tooltipStyle = {
  width: WIDTH + 'px',
  height: HEIGHT + 'px',
  borderRadius: '2px',
  border: '1px solid #b58787',
  padding: '7px',
  backgroundColor: '#fff',
  textAlign: 'left',
  fontSize: '16px',
  fontFamily: 'sans-serif',
  color: '#111',
  boxShadow: '4px 6px 20px 0px rgba(0, 0, 0, 0.4)',
  position: 'relative'
}
const interfacePanelStyle = {
  marginTop: '55px',
  marginLeft: '0%'
}
const buttonStyle = {
  marginLeft: '2.625%',
  marginTop: '-10px',
  color: 'white',
  clear: 'both',
  border: '1px solid #2E2F2F',
  backgroundImage: 'linear-gradient(#4F5151, #474949 6%, #3F4141)',
  backgroundColor: '#474949',
  borderColor: '#474949',
  lineHeight: '1.42857143',
  borderRadius: '4px',
  textAlign: 'center',
  verticalAlign: 'middle',
  cursor: 'pointer'
}
const pushedButton = {
  ...buttonStyle,
  backgroundImage: 'linear-gradient(#3F4141, #474949 6%, #4F5151)'
}
const markerStyle = {
  marginLeft: '-50%',
  color: 'black',
  width: '100%'
}
const disabledStyle = {
  ...buttonStyle,
  color: 'graytext',
  backgroundImage: 'linear-gradient(#D8D8D8, #D8D8D8)',
  clear: 'both'
}
const inputStyle = {
  ...buttonStyle,
  maxWidth: '47px',
  textAlign: 'center',
  clear: 'both',
  cursor: 'text'
}

function tooltipComponentFactory (getDataFunction) {
  return class TooltipComponent extends Component {
    constructor (props) {
      super(props)
      const newState = getDataFunction(props.biggId)
      this.state = {
        ...newState,
        lowerBoundString: '',
        upperBoundString: ''
      }
    }

    componentDidMount () {
      this.props.callbackManager.set('setState', newState => {
        const data = getDataFunction(newState.biggId)
        this.setState({
          ...newState,
          ...data,
          lowerBoundString: parseFloat(this.state.lowerBoundString) === data.lowerBound
            ? this.state.lowerBoundString
            : data.lowerBound.toString(),
          upperBoundString: parseFloat(this.state.upperBoundString) === data.upperBound
          ? this.state.upperBoundString
          : data.upperBound.toString(),
          knockoutButton: buttonStyle,
          resetReactionButton: buttonStyle,
          objectiveButton: buttonStyle
        })
      })
      this.props.callbackManager.run('attachGetSize', null, this.getSize.bind(this))
    }

    getSize () {
      return {width: WIDTH, height: HEIGHT}
    }

    /**
     * Due to bugs inherent in the slider, all values must be converted to fall
     * somewhere onto the positive number line in order to be displayed correctly
     * on the slider. This function takes a given value and converts it so that it
     * will display on the number line correctly.
     * @param {number} value - Physiologically relevant number to be displayed on
     * slider.
     */
    fluxConverter (value) {
      return value < this.state.lowerRange // Add parenthesis for better readability
        ? -1000
        : value > this.state.upperRange
        ? 1000
        : value + this.state.upperRange + 1
    }

    /**
     * Due to bugs inherent in the slider, all values must be converted to fall
     * somewhere onto the positive number line in order to be displayed correctly
     * on the slider. This function takes values from the slider and converts them
     * back to a physiologically relevant value.
     * @param {number} value - Slider value to be converted to physiologically
     * relevant value.
     */
    tipConverter (value) {
      let sigFig = 0
      if (this.state.step < 1) {
        sigFig = Math.ceil(-Math.log10(this.state.step))
      }
      return value === 0
      ? -1000
      : value === (2 * (this.state.upperRange + 1))
      ? 1000
      : parseFloat((value - (this.state.upperRange + 1)).toFixed(sigFig))
    }

    /**
     * Function for applying tipConverter to arrays of numbers.
     * @param {number[]} array - Pair of values (lower and upper bounds,
     * respectively) to be converted from slider values to physiologically
     * relevant values.
     */
    boundConverter (array) {
      return array.map(this.tipConverter.bind(this))
    }

    handleFocus (event) {
      event.target.select()
    }

    mouseDown (event) {
      this.setState({
        [event.target.name]: pushedButton
      })
    }

    mouseUp (event) {
      this.setState({
        [event.target.name]: buttonStyle
      })
    }

    handleMarkerPosition (currentFlux) {
      if (this.state.isAlive) {
        return currentFlux < this.state.lowerRange // Add parenthesis for better readability
          ? 0
          : currentFlux > this.state.upperRange
          ? 2 * (this.state.upperRange + 1)
          : currentFlux + this.state.upperRange + 1
      } else {
        return this.state.upperRange + 1
      }
    }

    handleKeyUp (event, bounds) {
      this.setState({
        lowerBoundString: bounds[0],
        upperBoundString: bounds[1]
      })
      if (isNaN(parseFloat(event.target.value))) {
        console.log('Invalid Bounds')
      } else {
        this.state.sliderChange([parseFloat(this.state.lowerBoundString), parseFloat(this.state.upperBoundString)])
      }
    }

    render () {
      const stateData = getDataFunction(this.state.biggId)
      // const this.state = this.state.data
      return (
        <div className='Tooltip'
          style={{
            ...tooltipStyle
          }}
          >
          <div style={{fontSize: '20px', fontWeight: 'bold'}}>
            {this.state.biggId}
          </div>
          <div style={{fontSize: '15px', marginBottom: '6px'}}>
            {this.state.name}
          </div>
          <MultiSlider
            min={0}
            max={2 * (this.state.upperRange + 1)}
            step={this.state.step}
            value={[
              this.state.lowerBound + 26,
              this.state.upperBound + 26
            ]}
            tipFormatter={f => this.tipConverter(f)}
            allowCross={false}
            pushable={0}
            onChange={_.throttle(f => this.state.sliderChange(this.boundConverter(f)))}
            onAfterChange={f => this.state.sliderChange(this.boundConverter(f))}
            marks={{ [this.handleMarkerPosition(stateData.currentFlux)]: <div style={markerStyle}>
              <div style={{...this.state.indicatorStyle, fontSize: '20px'}}>&#11014;</div>
              <div style={this.state.markerLabelStyle}>
                Current Flux: {this.state.data}
              </div>
            </div> } //  Define outside of return function
            }
          />
          {/* Kebab case for class names?  */}
          <div className='interfacePanel' style={interfacePanelStyle}>
            <div
              style={{
                fontSize: '12px',
                float: 'left'
              }}
            >
            Lower bound
            </div>
            <div
              style={{
                fontSize: '12px',
                float: 'right'
              }}
            >
            Upper bound
            </div>
            <br />
            <input
              type='text'
              name='lowerBound'
              value={this.state.lowerBoundString}
              style={inputStyle}
              onFocus={this.handleFocus}
              onKeyUp={
                event => this.handleKeyUp(event, [event.target.value, this.state.upperBound])
              }
            />
            <button
              name='knockoutButton'
              onMouseDown={this.mouseDown.bind(this)}
              onMouseUp={this.mouseUp.bind(this)}
              onMouseLeave={this.mouseUp.bind(this)}
              onClick={
                () => this.state.sliderChange([0, 0])
              }
              style={this.state.knockoutButton}
            >
              Knockout Reaction
            </button>
            <button
              name='resetReactionButton'
              onMouseDown={this.mouseDown.bind(this)}
              onMouseUp={this.mouseUp.bind(this)}
              onMouseLeave={this.mouseUp.bind(this)}
              onClick={() => this.state.resetReaction(this.state.biggId)}
              style={this.state.resetReactionButton}
            >
              Reset
            </button>
            <button
              name='objectiveButton'
              onMouseDown={this.mouseDown.bind(this)}
              onMouseUp={this.mouseUp.bind(this)}
              onMouseLeave={this.mouseUp.bind(this)}
              onClick={() => this.state.setObjective(this.state.biggId)}
              disabled={stateData.isCurrentObjective}
              style={stateData.isCurrentObjective ? disabledStyle : this.state.objectiveButton}
            >
              Set Objective
            </button>
            <input
              type='text'
              name='upperBound'
              value={this.state.upperBoundString}
              style={inputStyle}
              onFocus={this.handleFocus}
              onKeyUp={
                event => this.handleKeyUp(event, [this.state.lowerBound, event.target.value])
              }
            />
          </div>
        </div>
      )
    }
  }
}

export default tooltipComponentFactory
