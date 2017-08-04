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
  'position': 'relative',
}
const InterfacePanelStyle = {
  'margin-top': '55px',
  'margin-left': '0%'
}
const buttonStyle = {
  'margin-left': '2.5%'
}
const markerStyle = {
  'margin-left': '-99%'
}
const disabled = {
  'margin-left': '5%',
  'color': 'graytext'
}
// const inputStyle = {
//   ...buttonStyle,
//   maxWidth: '47px',
//   textAlign: 'center',
// }
let objectiveButtonStyle = null

const fluxConverter = f => f < -25 ? -1000 : f > 25 ? 1000 : f + 26
const tipConverter = f => f === 0 ? -1000 : f === 52 ? 1000 : f - 26
const boundConverter = x => x.map(tipConverter)

class TooltipComponent extends Component {
  constructor (props) {
    super(props)
    this.state = {
      lowerBound: this.props.lowerBound,
      upperBound: this.props.upperBound,
      currentFlux: fluxConverter(this.props.currentFlux)
    }
    if (!this.props.isCurrentObjective) {
      objectiveButtonStyle = buttonStyle
    } else {
      objectiveButtonStyle = disabled
    }
    //this.handleInputChange = this.handleInputChange.bind(this)
  }

  componentWillReceiveProps (nextProps) {
    this.setState({
      lowerBound: this.nextProps.lowerBound,
      upperBound: this.nextProps.upperBound
    })
    if (!this.props.isCurrentObjective) {
      objectiveButtonStyle = buttonStyle
    } else {
      objectiveButtonStyle = disabled
    }
  }

  resetReaction (biggId) {
    this.props.resetReaction(biggId)
  }

  sliderChange (bounds) {
    this.props.sliderChange(bounds)
    this.setState({
      lowerBound: bounds[0],
      upperBound: bounds[1]
    })
  }

  // handleInputChange(event) {
  //   this.setState({
  //     lowerBound: parseInt(event.target.value, 10)
  //   })
  // }

  render () {
    //  console.log('Rendering Tooltip', this.props)
    return (
      <div className='Tooltip' 
           style={{
             ...tooltipStyle
             //left: this.props.displacement.x,
             //top: this.props.displacement.y,
           }}
        >
        <MultiSlider
          min={0}
          max={52}
          defaultValue={[
            this.state.lowerBound + 26,
            this.state.upperBound + 26
          ]}
          tipFormatter={f => tipConverter(f)}
          allowCross={false}
          pushable={0}
          onChange={_.throttle(f => this.sliderChange(boundConverter(f)))}
          onAfterChange={f => this.sliderChange(boundConverter(f))}
          marks={ { [this.state.currentFlux]: <div style={markerStyle}>
            &#11014;<br />Current Flux<br />{[tipConverter(this.state.currentFlux)]}</div> } 
          }
        />
        <div className='InterfacePanel' style={InterfacePanelStyle}>
          {/* <input 
            type='text'
            name='lowerBound'
            value={this.state.lowerBound}
            style={inputStyle}
            onChange={this.handleInputChange}
            /> */}
          <button
            className='knockoutButton' 
            onClick={() => this.sliderChange([0,0])}
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
            style={objectiveButtonStyle}
          >
            Set Objective
          </button>
          {/* <input 
            type='text'
            name='upperBound'
            value={this.state.upperBound}
            defaultValue={this.state.upperBound}
            style={inputStyle}/> */}
        </div>
      </div>
    )
  }
}

export default TooltipComponent
