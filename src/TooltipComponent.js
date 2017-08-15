import { h, Component } from 'preact'
import { MultiSlider } from 'preact-range-slider'
import 'preact-range-slider/assets/index.css'
import * as escher from 'escher-vis'
const _ = escher.libs.underscore

const tooltipStyle = {
  'width': '500px',
  'height': '185px',
  'border-radius': '2px',
  'border': '1px solid #b58787',
  'padding': '7px',
  'background-color': '#fff',
  'text-align': 'left',
  'font-size': '16px',
  'font-family': 'sans-serif',
  'color': '#111',
  'box-shadow': '4px 6px 20px 0px rgba(0, 0, 0, 0.4)',
  'position': 'relative'
}
const interfacePanelStyle = {
  'margin-top': '55px',
  'margin-left': '0%'
}
const buttonStyle = {
  'margin-left': '2.5%',
  'margin-top': '-10px',
  clear: 'both'
}
const markerStyle = {
  'margin-left': '-50%',
  width: '100%'
}
const disabledStyle = {
  'margin-left': '2.5%',
  'color': 'graytext',
  clear: 'both'
}
const inputStyle = {
  ...buttonStyle,
  maxWidth: '47px',
  textAlign: 'center',
  clear: 'both'
}

function tooltipComponentFactory (getDataFunction) {
  return class TooltipComponent extends Component {
    constructor (props) {
      super(props)
      let newState = getDataFunction(props.biggId)
      this.state = newState
    }

    componentDidMount () {
      this.props.callbackManager.set('setState', this.setState.bind(this))
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
      return value < this.props.lowerRange // Add parenthesis for better readability
        ? -1000
        : value > getDataFunction(this.state.biggId).upperRange
        ? 1000
        : value + (getDataFunction(this.state.biggId).upperRange + 1)
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
      return value === 0
      ? -1000
      : value === (2 * (getDataFunction(this.state.biggId).upperRange + 1))
      ? 1000
      : value - (getDataFunction(this.state.biggId).upperRange + 1)
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

    handleKeyUp (event, bounds) {
      if (isNaN(parseInt(event.target.value, 10)) && event.target.value !== '.') {
        console.log('Invalid Bounds')
      } else {
        this.state.sliderChange(bounds)
      }
    }

    render () {
      return (
        <div className='Tooltip'
          style={{
            ...tooltipStyle
              // left: this.props.displacement.x,
              // top: this.props.displacement.y,
          }}
          >
          <div style={{fontSize: '20px', fontWeight: 'bold'}}>
            {this.state.biggId}
          </div>
          <div style={{fontSize: '15px'}}>
            {getDataFunction(this.state.biggId).name}
          </div>
          <MultiSlider
            min={0}
            max={2 * (this.state.upperRange + 1)}
            step={this.state.step}
            value={[
              getDataFunction(this.state.biggId).lowerBound + 26,
              getDataFunction(this.state.biggId).upperBound + 26
            ]}
            tipFormatter={f => this.tipConverter(f)}
            allowCross={false}
            pushable={0}
            onChange={_.throttle(f => this.state.sliderChange(this.boundConverter(f)))}
            onAfterChange={f => this.state.sliderChange(this.boundConverter(f))}
            marks={{ [this.fluxConverter(getDataFunction(this.state.biggId).currentFlux)]: <div style={markerStyle}>
              <div style={{fontSize: '20px'}}>&#11014;</div>
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
              value={this.state.lowerBound}
              style={inputStyle}
              onFocus={this.handleFocus}
              onKeyUp={
                event => this.handleKeyUp(event, [parseInt(event.target.value, 10), this.state.upperBound])
              }
            />
            <button
              className='knockoutButton'
              onClick={() => this.state.sliderChange([0, 0])}
              style={buttonStyle}
            >
              Knockout Reaction
            </button>
            <button
              className='resetReactionButton'
              onClick={() => this.state.resetReaction(this.state.biggId)}
              style={buttonStyle}
            >
              Reset
            </button>
            <button
              className='objectiveButton'
              onClick={() => this.state.setObjective(this.state.biggId)}
              disabled={this.state.isCurrentObjective}
              style={this.state.isCurrentObjective ? disabledStyle : buttonStyle}
            >
              Set Objective
            </button>
            <input
              type='text'
              name='upperBound'
              value={this.state.upperBound}
              style={inputStyle}
              onFocus={this.handleFocus}
              onKeyUp={
                event => this.handleKeyUp(event, [this.state.lowerBound, parseInt(event.target.value, 10)])
              }
            />
          </div>
        </div>
      )
    }
  }
}

export default tooltipComponentFactory
