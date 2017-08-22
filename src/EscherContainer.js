/** @jsx h */
import { h, Component } from 'preact'
import * as escher from 'escher-vis'
import 'escher-vis/css/dist/builder.css'
import TooltipComponent from './TooltipComponent.js'
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
    console.log(this.props)
    this.state.builder.pass_tooltip_component_props(nextProps)
    _.defer(() => {
      this.state.builder.set_reaction_data(nextProps.reactionData)
    })
    if (nextProps.reactionData !== null) {
      this.state.builder.map.set_status(
        `<div>Current Objective: ${nextProps.currentObjective}</div>
        <div>Flux Through Objective: ${(nextProps.reactionData[nextProps.currentObjective]).toFixed(2)}</div>`)
    } else {
      this.state.builder.map.set_status(
        `<div>Current Objective: ${nextProps.currentObjective}</div>
        <div>You killed E.coli!</div>`)
    }
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
      tooltip_component: TooltipComponent
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
