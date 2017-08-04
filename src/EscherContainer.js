import { h, Component, render } from 'preact'
import { Builder } from 'escher-vis'
import 'escher-vis/css/dist/builder.css'
import TooltipComponent from './TooltipComponent.js'

class EscherContainer extends Component {
  constructor (props) {
    super(props)
    this.state = {
      model: this.props.model,
      map: this.props.map,
      builder: null,
      tooltipForceRenderFunction: null,
      isCurrentObjective: false
    }
  }
  shouldComponentUpdate = () => false

  componentWillReceiveProps (nextProps) {
    if (this.state.builder === null) {
      console.warn('Builder not loaded yet')
      return
    }
    // console.log('Setting reaction data')
    this.state.builder.set_reaction_data(nextProps.reactionData)
    this.setState({
      model: nextProps.model
    })
  }

  componentDidMount () {
    let b
    b = new Builder(this.state.map, this.state.model, null, this.base, {
      fill_screen: true,
      tooltip_component: ({ el, state }) => {
        var window_translate = b.zoom_container.window_translate
        var window_scale = b.zoom_container.window_scale
        var map_size = b.zoom_container.get_size()
        var x = window_scale * state.loc.x + window_translate.x
        var y = window_scale * state.loc.y + window_translate.y

        if (x + 500 > map_size.width) {
          el.style.left = (parseInt(el.style.left, 10) - 500) + 'px'
        }

        if (y + 120 > map_size.height) {
          el.style.top = (parseInt(el.style.top, 10) - 120) + 'px'
        }

        for (let i = 0; i < el.children.length; i++) {
          el.children[i].remove()          
        }

        // Don't display tooltip for metabolites
        if (state.type === 'metabolite') {
          this.tooltipForceRenderFunction = null
          return
        }

        // Get attributes from reaction
        let lowerBound = 0
        let upperBound = 0
        let currentFlux = 0
        let biggId = null
        // see story on indexing objects by bigg id
        for (let i = 0, l = this.state.model.reactions.length; i < l; i++) {
          if (this.state.model.reactions[i].id === state.biggId) {
            lowerBound = this.state.model.reactions[i].lower_bound
            upperBound = this.state.model.reactions[i].upper_bound
            biggId = state.biggId
            if (this.props.currentObjective === state.biggId) {
              this.setState({
                isCurrentObjective: true
              })
            } else {
              this.setState({
                isCurrentObjective: false
              })
            }
            if (this.props.reactionData !== null) {
              currentFlux = this.props.reactionData[state.biggId]
            } 
          }
        }
        render(
          <TooltipComponent
            //  would work better if we could use: displacement={{x: -100, y: 200}}
            lowerBound={lowerBound}
            upperBound={upperBound}
            biggId={biggId}
            currentFlux={currentFlux}
            isCurrentObjective={this.state.isCurrentObjective}
            sliderChange={f => this.props.sliderChange(f, state.biggId)}
            resetReaction={(biggId) => this.props.resetReaction(biggId)}
            setObjective={(biggId) => this.props.setObjective(biggId)}
          />,
        el)
      }
    })
    this.setState({ builder: b })
  }

  render () {
    return (
      <div className='EscherContainer' />
    )
  }
}

export default EscherContainer
