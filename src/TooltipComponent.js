import { h, Component } from 'preact'
import { MultiSlider } from 'preact-range-slider'
import 'preact-range-slider/assets/index.css'
import * as escher from 'escher-vis'
const _ = escher.libs.underscore

const tooltipStyle = {
  'min-width': '500px',
  'min-height': '80px',
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
  'margin-left': '2.5%'
}
const markerStyle = {
  'margin-left': '-99%'
}
const disabledStyle = {
  'margin-left': '2.5%',
  'color': 'graytext'
}
const inputStyle = {
  ...buttonStyle,
  maxWidth: '47px',
  textAlign: 'center'
}

class TooltipComponent extends Component {
  constructor (props) {
    super(props)
    this.state = {
      lowerBound: this.props.lowerBound,
      upperBound: this.props.upperBound,
      currentFlux: this.fluxConverter(this.props.currentFlux)
    }
  }

  componentWillReceiveProps (nextProps) {
    this.setState({
      lowerBound: this.nextProps.lowerBound,
      upperBound: this.nextProps.upperBound
    })
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
      : value > this.props.upperRange 
      ? 1000 
      : value + (this.props.upperRange + 1)
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
    : value === (2 * (this.props.upperRange + 1)) 
    ? 1000 
    : value - (this.props.upperRange + 1)
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

  /**
   * Event listener for App's resetReaction method. Sends current BiGG ID up to
   * EscherContainer.
   * @param {string} biggId - The BiGG ID of the reaction.
   */
  resetReaction (biggId) {
    this.props.resetReaction(biggId)
  }

  /**
   * Handles all changes to the reaction made within the tooltip itself. First
   * passes the new values up the hierarchy then sets the internal state.
   * @param {number[]} bounds - The new lower and upper bounds, respectively, of
   * the reaction.
   */
  sliderChange (bounds) {
    this.props.sliderChange(bounds)
    // Eventually will remove state setting when tooltips are fully reactive
    this.setState({
      lowerBound: bounds[0],
      upperBound: bounds[1]
    })
  }

  /**
   * Handler for the bound input fields. Extracts the field's name from
   * event.target and uses it to decide which bound to modify before passing the
   * changes up the hierarchy.
   * @param {Object} event - Reference to the onChange event of the input field.
   */
  handleInputChange (event) {
    this.setState({
      [event.target.name]: parseInt(event.target.value, 10)
    })
    this.props.sliderChange([this.state.lowerBound, this.state.upperBound])
  }

  render () {
    //  console.log('Rendering Tooltip', this.props)
    return (
      <div className='Tooltip'
        style={{
          ...tooltipStyle
             // left: this.props.displacement.x,
             // top: this.props.displacement.y,
        }}
        >
        <MultiSlider
          min={0}
          max={2 * (this.props.upperRange + 1)}
          defaultValue={[
            this.state.lowerBound + 26,
            this.state.upperBound + 26
          ]}
          tipFormatter={f => this.tipConverter(f)}
          allowCross={false}
          pushable={0}
          onChange={_.throttle(f => this.sliderChange(this.boundConverter(f)))}
          onAfterChange={f => this.sliderChange(this.boundConverter(f))}
          marks={{ [this.state.currentFlux]: <div style={markerStyle}>
            <div style={{fontSize: '20px'}}>&#11014;</div>Current Flux: {[escher.data_styles.text_for_data([this.tipConverter(this.state.currentFlux)], true)]}</div> } //  Define outside of return function
          }
        />
        {/*Kebab case for class names?  */}
        <div className='interfacePanel' style={interfacePanelStyle}>
          <input
            type='text'
            name='lowerBound'
            value={this.state.lowerBound}
            style={inputStyle}
            onChange={this.handleInputChange.bind(this)}
          />
          <button
            className='knockoutButton'
            onClick={() => this.sliderChange([0, 0])}
            style={buttonStyle}
          >
            Knockout Reaction
          </button>
          <button
            className='resetReactionButton'
            onClick={() => this.resetReaction(this.props.biggId)}
            style={buttonStyle}
          >
            Reset
          </button>
          <button
            className='objectiveButton'
            onClick={() => this.props.setObjective(this.props.biggId)}
            disabled={this.props.isCurrentObjective}
            style={this.props.isCurrentObjective ? disabledStyle : buttonStyle}
          >
            Set Objective
          </button>
          <input
            type='text'
            name='upperBound'
            value={this.state.upperBound}
            style={inputStyle}
            onChange={this.handleInputChange.bind(this)}
          />
        </div>
      </div>
    )
  }
}

export default TooltipComponent
