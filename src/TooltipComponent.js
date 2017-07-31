import { h, Component } from 'preact'
import { MultiSlider } from 'preact-range-slider'
import 'preact-range-slider/assets/index.css'

class TooltipComponent extends Component {
  render () {
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
    console.log('Rendering Tooltip', this.props)
    return (
      <div className="Slider" style={ tooltipStyle }>
         <MultiSlider
          min={ -1000 }
          max={ 1000 }
          defaultValue={ [this.props.lowerBound, 
                          this.props.upperBound] }
          allowCross={ false }
          pushable={ 1 }
          //onAfterChange={(value)=>[min, max]}
        />
      </div>
    )
  }
}

export default TooltipComponent