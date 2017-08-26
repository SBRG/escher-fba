/** @jsx h */
import { h, Component } from 'preact'
import { Range } from 'rc-slider-preact'
import 'rc-slider-preact/lib/index.css'

const WIDTH = 500
const HEIGHT = 185
// or: import { WIDTH } from './constants'

const tooltipStyle = {
  width: WIDTH + 'px',
  height: HEIGHT + 'px',
  borderRadius: '2px',
  border: '1px solid #b58787',
  padding: '1.5%',
  backgroundColor: '#fff',
  textAlign: 'left',
  fontSize: '16px',
  fontFamily: 'sans-serif',
  color: '#111',
  boxShadow: '4px 6px 20px 0px rgba(0, 0, 0, 0.4)',
  position: 'relative'
}
const interfacePanelStyle = {
  //  boxSizing: 'border-box',
  position: 'absolute',
  bottom: '4%',
  width: '100%'
}
const buttonStyle = {
  clear: 'both',
  margin: '0% 1.5%',
  color: 'white',
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
const sliderStyle = {
  width: '97.575534823%',
  display: 'block',
  margin: 'auto'
}
const markerStyle = {
  marginLeft: '-50%',
  color: 'black',
  width: '100%'
}
const markerLabelStyle = {
  position: 'relative',
  color: 'black',
  visibility: 'visible'
}
const indicatorStyle = {
  height: '10%',
  left: '0%',
  visibility: 'visible'
}
const disabledStyle = {
  ...buttonStyle,
  color: 'graytext',
  backgroundImage: 'linear-gradient(#D8D8D8, #D8D8D8)',
  clear: 'both',
  cursor: 'not-allowed'
}
const inputStyle = {
  ...buttonStyle,
  position: 'relative',
  maxWidth: '47px',
  textAlign: 'center',
  cursor: 'text'
}

class TooltipComponent extends Component {
  constructor (props) {
    super(props)
    this.state = {
      lowerBoundString: '',
      upperBoundString: '',
      markerLabelStyle: {
        position: 'relative',
        color: 'black',
        visibility: 'visible'
      }
    }
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.type === 'reaction' && nextProps.model !== undefined) {
      const fluxData = {}
      if (nextProps.biggId !== this.props.biggId || nextProps.model !== this.props.model) {
        for (let i = 0, l = nextProps.model.reactions.length; i < l; i++) {
          if (nextProps.model.reactions[i].id === nextProps.biggId) {
            fluxData.lowerBound = nextProps.model.reactions[i].lower_bound
            fluxData.upperBound = nextProps.model.reactions[i].upper_bound
            fluxData.lowerBoundString = nextProps.model.reactions[i].lower_bound.toString()
            fluxData.upperBoundString = nextProps.model.reactions[i].upper_bound.toString()
            fluxData.lowerBoundOld = nextProps.oldModel.reactions[i].lower_bound
            fluxData.upperBoundOld = nextProps.oldModel.reactions[i].upper_bound
            fluxData.name = nextProps.model.reactions[i].name
            if (nextProps.currentObjective === nextProps.biggId) {
              fluxData.isCurrentObjective = true
            } else {
              fluxData.isCurrentObjective = false
            }
            if (nextProps.reactionData !== null) {
              fluxData.currentFlux = nextProps.reactionData[nextProps.biggId]
            }
            break
          }
        }
      } else {
        for (let i = 0, l = nextProps.model.reactions.length; i < l; i++) {
          if (nextProps.model.reactions[i].id === nextProps.biggId) {
            if (nextProps.reactionData !== null) {
              fluxData.currentFlux = nextProps.reactionData[nextProps.biggId]
            }
            break
          }
        }
      }

      const markerPosition = (fluxData.currentFlux + nextProps.upperRange) / (2 * (1 + nextProps.upperRange))
      let textOffset = {}
      let arrowStyle = {}
      if (markerPosition > 0.8875 && markerPosition < 0.963) {
        textOffset = {
          left: -(475 * (markerPosition - 0.8875)) + '%'
        }
      } else if (markerPosition < 0.075 && markerPosition >= 0) {
        textOffset = {
          left: -(450 * (markerPosition - 0.075)) + '%'
        }
      } else if (markerPosition >= 0.963) {
        textOffset = {
          left: -45 + '%'
        }
      } else if (markerPosition < 0) {
        textOffset = {
          left: 42.5 + '%'
        }
      } else if (nextProps.reactionData === null) {
        textOffset = {
          visibility: 'hidden'
        }
        arrowStyle = {
          visibility: 'hidden'
        }
      }

      this.setState({
        ...fluxData,
        // lowerBoundString,
        // upperBoundString,
        markerLabelStyle: {...markerLabelStyle, ...textOffset},
        indicatorStyle: {...indicatorStyle, ...arrowStyle},
        knockoutButton: buttonStyle,
        resetReactionButton: buttonStyle,
        objectiveButton: buttonStyle,
        type: nextProps.type
      })
    } else {
      this.setState({
        type: nextProps.type
      })
    }
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
    return value < this.props.lowerRange // Add parenthesis for better readability
      ? -1000
      : value > this.props.upperRange
      ? 1000
      : value + this.props.upperRange + 1
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
    if (this.props.step < 1) {
      sigFig = Math.ceil(-Math.log10(this.props.step))
    }
    return value < 1
    ? -1000
    : value > (2 * this.props.upperRange + 1)
    ? 1000
    : parseFloat((value - (this.props.upperRange + 1)).toFixed(sigFig))
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
    if (this.props.reactionData !== null) {
      return currentFlux < this.props.lowerRange // Add parenthesis for better readability
        ? 0
        : currentFlux > this.props.upperRange
        ? 2 * (this.props.upperRange + 1)
        : currentFlux + this.props.upperRange + 1
    } else {
      return this.props.upperRange + 1
    }
  }

  handleKeyUp (event, bounds) {
    this.setState({
      lowerBoundString: bounds[0],
      upperBoundString: bounds[1]
    })
    if (parseFloat(bounds[0]) !== this.state.lowerBound || parseFloat(bounds[1]) !== this.state.upperBound) {
      if (isNaN(parseFloat(event.target.value))) {
        console.log('Invalid Bounds')
      } else {
        this.sliderChange([parseFloat(this.state.lowerBoundString), parseFloat(this.state.upperBoundString)])
      }
    }
  }

  sliderChange (bounds) {
    if (bounds[0] !== parseFloat(this.state.lowerBoundString) || bounds[1] !== parseFloat(this.state.upperBoundString)) {
      this.setState({
        lowerBound: bounds[0],
        upperBound: bounds[1],
        lowerBoundString: bounds[0].toString(),
        upperBoundString: bounds[1].toString()
      })
    } else {
      this.setState({
        lowerBound: bounds[0],
        upperBound: bounds[1]
      })
    }
    this.props.sliderChange(bounds, this.props.biggId)
  }

  resetReaction () {
    this.sliderChange([this.state.lowerBoundOld, this.state.upperBoundOld], this.props.biggId)
  }

  render () {
    if (this.state.type === 'reaction' && this.props.model !== undefined) {
      return (
        <div className='Tooltip'
          style={{
            ...tooltipStyle
          }}
          >
          <div style={{fontSize: '20px', fontWeight: 'bold'}}>
            {this.props.biggId}
          </div>
          <div style={{fontSize: '15px', marginBottom: '6px'}}>
            {this.props.name}
          </div>
          <Range
            style={sliderStyle}
            min={0}
            max={2 * (this.props.upperRange + 1)}
            step={this.props.step}
            value={[
              this.fluxConverter(this.state.lowerBound),
              this.fluxConverter(this.state.upperBound)
            ]}
            tipFormatter={() => null}
            allowCross={false}
            pushable={0}
            onChange={f => this.sliderChange(this.boundConverter(f))}
            onAfterChange={f => this.sliderChange(this.boundConverter(f))}
              //  this.handleMarkerPosition(this.state.currentFlux): {{...this.state.indicatorStyle, fontSize: '20px'}, '&#11014;'}}
              /* <div style={markerStyle}>
                <div style={{...this.state.indicatorStyle, fontSize: '20px'}}>&#11014;</div>
                <div style={this.state.markerLabelStyle}>
                  Current Flux: {this.props.data}
                </div>
              </div>  */
            // } //  Define outside of return function */}
          />
          <div name='indicator' style={indicatorStyle}>
            <svg viewBox='0 0 100 100' height='100%' width='100%'>
              <defs>
                <marker id='markerArrow1' viewBox='0 0 6 6' refX='4' refY='3' orient='auto'>
                  <path d='M5,3 L3,5 L3,1 Z' fill='black' stroke='black' />
                </marker>
              </defs>
              <line x1='5' y1='3' x2='5' y2='1' stroke-width='0.5' stroke='black' marker-end={'url(#markerArrow1)'} />
            </svg>
          </div>
          {/* Kebab case for class names?  */}
          <div className='interfacePanel' style={interfacePanelStyle}>
            <div className='labels'>
              <div
                style={{
                  float: 'left',
                  fontSize: '12px'
                }}
              >
              Lower bound
              </div>
              <div
                style={{
                  float: 'right',
                  fontSize: '12px'
                }}
              >
              Upper bound
              </div>
            </div>
            <div className='buttons' style={{clear: 'both'}}>
              <input
                type='text'
                name='lowerBound'
                value={this.state.lowerBoundString}
                style={inputStyle}
                onFocus={(event) => event.target.select()}
                onKeyUp={
                  event => this.handleKeyUp(event, [event.target.value, this.state.upperBoundString])
                }
              />
              <button
                name='knockoutButton'
                onMouseDown={this.mouseDown.bind(this)}
                onMouseUp={this.mouseUp.bind(this)}
                onMouseLeave={this.mouseUp.bind(this)}
                onClick={
                  () => this.sliderChange([0, 0])
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
                onClick={() => this.resetReaction()}
                style={this.state.resetReactionButton}
              >
                Reset
              </button>
              <button
                name='objectiveButton'
                onMouseDown={this.mouseDown.bind(this)}
                onMouseUp={this.mouseUp.bind(this)}
                onMouseLeave={this.mouseUp.bind(this)}
                onClick={() => this.props.setObjective(this.props.biggId)}
                disabled={this.state.isCurrentObjective}
                style={this.state.isCurrentObjective ? disabledStyle : this.state.objectiveButton}
              >
                Set Objective
              </button>
              <input
                type='text'
                name='upperBound'
                value={this.state.upperBoundString}
                style={inputStyle}
                onFocus={(event) => event.target.select()}
                onKeyUp={
                  event => this.handleKeyUp(event, [this.state.lowerBound, event.target.value])
                }
              />
            </div>
          </div>
        </div>
      )
    } else if (this.state.type === 'reaction' && this.props.model === undefined) {
      return (
        <div className='Tooltip'
          style={{
            ...tooltipStyle,
            height: '50px',
            width: '400px'
          }}
          >
          <div style={{fontSize: '20px', fontWeight: 'bold'}}>
            {this.props.biggId} is not in the model
          </div>
        </div>
      )
    } else {
      return null
    }
  }
}

export default TooltipComponent
