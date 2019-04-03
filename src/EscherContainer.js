/** @jsx h */

import { h, Component } from 'preact'
import TooltipComponent from './TooltipComponent.js'
import { Builder } from 'escher'

class EscherContainer extends Component {
  constructor (props) {
    super(props)
    this.state = {
      builder: null
    }
  }

  //  Enables Escher handling DOM
  shouldComponentUpdate () {
    return false
  }

  componentWillReceiveProps (nextProps) {
    if (this.state.builder) {
      console.log('container', nextProps)
      this.state.builder.tooltip_container.passProps(nextProps)
      console.log('setting reaction data', this.state.builder, nextProps.reactionData)
      this.state.builder.set_reaction_data(nextProps.reactionData)
    }
  }

  kosAddGroup (builder) {
    // at the beginning
    const koMarkersSel = builder.selection
      .select('.zoom-g')
      .append('g').attr('id', 'ko-markers')
    this.setState({koMarkersSel})
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
    // eslint-disable-next-line no-new
    new Builder(this.props.map, this.props.model, null, this.base, {
      fill_screen: true,
      enable_keys: true,
      reaction_scale: [
        {type: 'min', color: '#c8c8c8', size: 12},
        {type: 'value', value: 0.01, color: '#9696ff', size: 16},
        {type: 'value', value: 20, color: '#209123', size: 20},
        {type: 'max', color: '#ff0000', size: 25}
      ],
      tooltip_component: TooltipComponent,
      reaction_styles: ['color', 'size', 'text', 'abs'],
      disabled_buttons: ['Load reaction data', 'Load gene data'],
      reaction_scale_preset: 'GaBuGeRd',
      metabolite_scale_preset: 'GaBuGeRd',
      never_ask_before_quit: true,
      first_load_callback: builder => {
        this.setState({ builder })
        builder.callback_manager.set('load_model', () => this.props.loadModel())
      }
    })
  }

  render () {
    return <div className='EscherContainer' />
  }
}

export default EscherContainer
