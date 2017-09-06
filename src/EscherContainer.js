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
    this.state.builder.pass_tooltip_component_props(nextProps)
    _.defer(() => {
      this.state.builder.set_reaction_data(nextProps.reactionData)
    })
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
      enable_keys: true,
      reaction_scale: [
        {type: 'min', color: '#c8c8c8', size: 12},
        {type: 'value', value: '0.01', color: '#9696ff', size: 16},
        {type: 'value', value: '20', color: '#209123', size: 20},
        {type: 'max', color: '#ff0000', size: 25}
      ],
      tooltip_component: TooltipComponent,
      hidden_buttons: ['Load reaction data', 'Load gene data']
    })
    this.setState({ builder })
    this.state.builder.callback_manager.set('load_model', this.props.loadModel.bind(this))
  }

  render () {
    return (
      <div className='EscherContainer' />
    )
  }
}

export default EscherContainer
