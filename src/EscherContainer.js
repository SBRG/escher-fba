/** @jsx h */
import { h, Component } from 'preact'
import * as escher from 'escher-vis'
import 'escher-vis/css/dist/builder.css'
import tooltipComponentFactory from './TooltipComponent.js'
//  const d3_select = escher.libs.d3_select
const _ = escher.libs.underscore
const Builder = escher.Builder

class EscherContainer extends Component {
  constructor (props) {
    super(props)
    this.state = {
      builder: null
    }
  }

  //  Enables Escher handling DOM
  shouldComponentUpdate = () => false

  componentWillReceiveProps (nextProps) {
    if (this.state.builder === null) {
      console.warn('Builder not loaded yet')
      return
    }

    // console.log('Setting reaction data')
    this.state.builder.set_reaction_data(nextProps.reactionData)
  }

  kosAddGroup (builder) {
    // at the beginning
    const koMarkersSel = builder.selection
      .select('.zoom-g')
      .append('g').attr('id', 'ko-markers')
    this.setState({koMarkersSel})

    _.values(builder.map.reactions, r => r.bigg_id === 'GAPD')
  }

  /**
   *
   * @param {string[]} reactionList - List of knocked out reactions.
   */
  koDrawRectanges (reactionList) {
    if (this.state.koMarkersSel === null) {
      console.warn('this.state.koMarkersSel is not defined')
      return
    }
    // every time this changes
    const sel = this.state.koMarkersSel.selectAll('.ko')
      .data(['GAPD'])
    const g = sel.enter()
      .append('g')
    g.append('rect')
      .style('fill', 'red')
    g.append('rect')
      .style('fill', 'red')
  }
  /**
   * Used to remotely set the state of the tooltip component.
   * @param {string} biggId - The BiGG ID of the reaction.
   */
  getProps (biggId) {
    // Get attributes from reaction
    // see story on indexing objects by bigg id
    // console.log('Running') //  Tracks getData being called
    // this.setState({
    //   sliderChange: f => this.props.sliderChange(f, biggId),
    //   resetReaction: f => this.props.resetReaction(f),
    //   setObjective: f => this.props.setObjective(f),
    //   isAlive: this.props.reactionData !== null,
    //   step: this.props.step,
    //   model: this.props.model,
    //   oldModel: this.props.oldModel,
    //   reactionData: this.props.reactionData,
    //   biggId,
    //   currentObjective: this.props.currentObjective,
    //   koMarkersSel: null,
    //   lowerRange: this.props.lowerRange,
    //   upperRange: this.props.upperRange
    // })
    const tooltipProps = {
      sliderChange: f => this.props.sliderChange(f, biggId),
      resetReaction: f => this.props.resetReaction(f),
      setObjective: f => this.props.setObjective(f),
      isAlive: this.props.reactionData !== null,
      step: this.props.step,
      model: this.props.model,
      oldModel: this.props.oldModel,
      reactionData: this.props.reactionData,
      biggId,
      currentObjective: this.props.currentObjective,
      koMarkersSel: null,
      lowerRange: this.props.lowerRange,
      upperRange: this.props.upperRange,
      isCurrentObjective: false
    }
    // for (let i = 0, l = this.props.model.reactions.length; i < l; i++) {
    //   if (this.props.model.reactions[i].id === biggId) {
    //     tooltipProps.lowerBound = this.props.model.reactions[i].lower_bound
    //     tooltipProps.upperBound = this.props.model.reactions[i].upper_bound
    //     tooltipProps.name = this.props.model.reactions[i].name
    //     if (this.props.currentObjective === biggId) {
    //       tooltipProps.isCurrentObjective = true
    //     }
    //     if (this.props.reactionData !== null) {
    //       tooltipProps.currentFlux = this.props.reactionData[biggId]
    //     }
    //     break
    //   }
    // }

    // let markerPosition = (tooltipProps.currentFlux + tooltipProps.upperRange) / (2 * (1 + tooltipProps.upperRange))
    tooltipProps.markerLabelStyle = {
      position: 'relative',
      color: 'black',
      visibility: 'visible'
    }
    tooltipProps.indicatorStyle = {
      visibility: 'visible'
    }
    // if (markerPosition > 0.8875 && markerPosition < 0.963) {
    //   tooltipProps.markerLabelStyle = {
    //     position: 'relative',
    //     left: -(475 * (markerPosition - 0.8875)) + '%'
    //   }
    // } else if (markerPosition < 0.075 && markerPosition >= 0) {
    //   tooltipProps.markerLabelStyle = {
    //     position: 'relative',
    //     left: -(450 * (markerPosition - 0.075)) + '%'
    //   }
    // } else if (markerPosition >= 0.963) {
    //   tooltipProps.markerLabelStyle = {
    //     position: 'relative',
    //     left: -45 + '%'
    //   }
    // } else if (markerPosition < 0) {
    //   tooltipProps.markerLabelStyle = {
    //     position: 'relative',
    //     left: 42.5 + '%'
    //   }
    // } else if (this.props.reactionData === null) {
    //   tooltipProps.markerLabelStyle = {
    //     visibility: 'hidden'
    //   }
    //   tooltipProps.indicatorStyle = {
    //     visibility: 'hidden'
    //   }
    // }
    if (this.state.builder !== null && this.props.reactionData !== null) {
      this.state.builder.map.set_status(
        `<div>Current Objective: ${this.props.currentObjective}</div>
        <div>Flux Through Objective: ${(this.props.reactionData[this.props.currentObjective]).toFixed(2)}</div>`)
    }
    return tooltipProps
  }

  componentDidMount () {
    // need a story to fix the first_load_callback
    const builder = new Builder(this.props.map, this.props.model, null, this.base, {
      fill_screen: true,
      // first_load_callback: builder => {
      //   builder.selection.select('.menu').selectAll('button').each(function () => {
      //     if (button.text === 'Load reaction data') {
      //       this.style('color', 'grey')
      //       this.attr('disabled', true)
      //     }
      //   })
      // },
      enable_keys: false,
      tooltip_component: tooltipComponentFactory(this.getProps.bind(this))
    })
    this.setState({ builder })
    setTimeout(() => {
      this.state.builder.map.set_status(
      `<div>Current Objective: ${this.props.currentObjective}</div>
      <div>Flux Through Objective: ${(this.props.reactionData[this.props.currentObjective]).toFixed(2)}</div>`)
    }, 500)
  }

  render () {
    return (
      <div className='EscherContainer' />
    )
  }
}

export default EscherContainer
