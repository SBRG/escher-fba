import { h, Component } from 'preact'
import { MultiSlider } from 'preact-range-slider'
import 'preact-range-slider/assets/index.css'

class TooltipComponent extends Component {
  sliderChange (bounds) {
    this.props.sliderChange(bounds)
  }

  render () {
    var tipConverter = (f) => f === 0 ? -1000 : f === 52 ? 1000 : f - 26

    const boundConverter = x => x.map(tipConverter)

    const tooltipStyle = {
      'min-width': '500px',
      'min-height': '50px',
      'border-radius': '2px',
      'border': '1px solid #b58787',
      'padding': '7px',
      'background-color': '#fff',
      'text-align': 'left',
      'font-size': '16px',
      'font-family': 'sans-serif',
      'color': '#111',
      'box-shadow': '4px 6px 20px 0px rgba(0, 0, 0, 0.4)',
    }

    //console.log('Rendering Tooltip', this.props)

    return (
      <div className="Slider" style={ tooltipStyle }>
         <MultiSlider
          min={ 0 }
          max={ 52 }
          defaultValue={ [this.props.lowerBound + 26, 
                          this.props.upperBound + 26] }
          tipFormatter={ f => tipConverter(f) }
          allowCross={ false }
          pushable={ 0 }
          onAfterChange={ f => this.sliderChange(boundConverter(f)) }
        />
      </div>
    )
  }
}

export default TooltipComponent