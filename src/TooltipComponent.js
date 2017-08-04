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
  'box-shadow': '4px 6px 20px 0px rgba(0, 0, 0, 0.4)'
}
const markerStyle = {
  'margin-left': '-99%'
}
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
  }

  componentWillReceiveProps (nextProps) {
    this.setState({
      lowerBound: this.nextProps.lowerBound,
      upperBound: this.nextProps.upperBound
    })
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

  render () {
    //  console.log('Rendering Tooltip', this.props)
    return (
      <div className='Tooltip' style={tooltipStyle}>
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
        <div className='Buttons'>
          <button
            className='knockoutButton' 
            onClick={() => this.sliderChange([0,0])}
          >
            Knockout Reaction
          </button>
          <br/>
          <button
            className='resetReactionButton' 
            onClick={() => this.resetReaction(this.props.biggId)}
          >
            Reset
          </button>
          <br/>
          <button 
            className='objectiveButton'
          >
            Set Objective
          </button>
        </div>
      </div>
    )
  }
}

export default TooltipComponent
