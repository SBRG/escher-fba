/** @jsx h */

import { h, Component } from 'preact'
import TooltipComponent from './TooltipComponent.jsx'
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
      this.state.builder.tooltip_container.passProps(nextProps)
      if (nextProps.reactionData !== this.props.reactionData) {
        this.state.builder.set_reaction_data(nextProps.reactionData)
      }
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
      tooltip_component: TooltipComponent,
      enable_keys_with_tooltip: false,
      reaction_styles: ['color', 'size', 'text', 'abs'],
      disabled_buttons: ['Load reaction data', 'Load gene data'],
      never_ask_before_quit: true,
      first_load_callback: builder => {
        this.setState({ builder })

        // when the model loads in escher, pass the data along
        builder.callback_manager.set('load_model', modelData => {
          this.props.loadModel(modelData)
        })

        // when a map loads, need to update the tooltip_component props
        builder.callback_manager.set('load_map', mapData => {
          this.state.builder.tooltip_container.passProps(this.props)
        })
      }
    })
  }

  render () {
    return <div className='EscherContainer' />
  }
}

export default EscherContainer
