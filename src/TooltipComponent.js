/** @jsx h */
import { h, Component } from 'preact'
import { MultiSlider } from 'preact-range-slider'
import 'preact-range-slider/assets/index.css'

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
const markerLabelStyle = {
  position: 'relative',
  color: 'black',
  visibility: 'visible'
}
const indicatorStyle = {
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
  maxWidth: '47px',
  textAlign: 'center',
  clear: 'both',
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

  // componentDidMount () {
  //   this.props.callbackManager.set('setState', nextProps => {
  //     const nextProps = getPropsFunction(nextProps.biggId)
  //     this.transformAndSetState(nextProps, nextProps)
  //   })
  //   this.props.callbackManager.run('attachGetSize', null, this.getSize.bind(this))
  // }

  componentWillReceiveProps (nextProps) {
    if (nextProps.type === 'reaction') {
      const fluxData = {}
      for (let i = 0, l = nextProps.model.reactions.length; i < l; i++) {
        if (nextProps.model.reactions[i].id === nextProps.biggId) {
          fluxData.lowerBound = nextProps.model.reactions[i].lower_bound
          fluxData.upperBound = nextProps.model.reactions[i].upper_bound
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

      const lowerBoundString = parseFloat(this.state.lowerBoundString) === fluxData.lowerBound
        ? this.state.lowerBoundString
        : fluxData.lowerBound.toString()

      const upperBoundString = parseFloat(this.state.upperBoundString) === fluxData.upperBound
        ? this.state.upperBoundString
        : fluxData.upperBound.toString()

      this.setState({
        ...fluxData,
        lowerBoundString,
        upperBoundString,
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
    return value === 0
    ? -1000
    : value === (2 * (this.props.upperRange + 1))
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
    if (isNaN(parseFloat(event.target.value))) {
      console.log('Invalid Bounds')
    } else {
      this.props.sliderChange([parseFloat(this.state.lowerBoundString), parseFloat(this.state.upperBoundString)], this.props.biggId)
    }
  }

  render () {
    if (this.state.type === 'reaction') {
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
          <MultiSlider
            min={0}
            max={2 * (this.props.upperRange + 1)}
            step={this.props.step}
            value={[
              this.fluxConverter(this.state.lowerBound),
              this.fluxConverter(this.state.upperBound)
            ]}
            tipFormatter={f => this.tipConverter(f)}
            allowCross={false}
            pushable={0}
            onChange={f => this.props.sliderChange(this.boundConverter(f), this.props.biggId)}
            onAfterChange={f => this.props.sliderChange(this.boundConverter(f), this.props.biggId)}
            marks={{ [this.handleMarkerPosition(this.state.currentFlux)]: <div style={markerStyle}>
              <div style={{...this.state.indicatorStyle, fontSize: '20px'}}>&#11014;</div>
              <div style={this.state.markerLabelStyle}>
                Current Flux: {this.props.data}
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
              onFocus={(event) => event.target.select()}
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
                () => this.props.sliderChange([0, 0], this.props.biggId)
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
              onClick={() => this.props.resetReaction(this.props.biggId)}
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
      )
    } else {
      return null
    }
  }
}

export default TooltipComponent
