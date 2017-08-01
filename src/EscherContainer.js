import { h, Component, render } from 'preact'
import { Builder } from 'escher-vis'
import 'escher-vis/css/dist/builder.css'
import model from './E coli core.json'
import map from './E coli core.Core metabolism.json'
import TooltipComponent from './TooltipComponent.js'

class EscherContainer extends Component {
  constructor() {
    super()
    this.state = { model: model, map: map, builder: null }
  }
  shouldComponentUpdate = () => false

  componentWillReceiveProps (nextProps) {
    if (this.state.builder === null) {
      console.warn('Builder not loaded yet')
      return
    }
    //console.log('Setting reaction data')
    this.state.builder.set_reaction_data(nextProps.reaction_data)
  }

  componentDidMount () {
    const b = new Builder(map, model, null, this.base, {
      tooltip_component: ({ el, state }) => {
        let lowerBound = 0
        let upperBound = 0
        for (let i = 0; i < el.children.length; i++) {
          el.children[i].remove()
        }
        for (var i = 0, l = model.reactions.length; i < l; i++) {
          if (model.reactions[i].id === state.biggId) {
            lowerBound = model.reactions[i].lower_bound
            upperBound = model.reactions[i].upper_bound
          }
        }
        render(
          <TooltipComponent 
            lowerBound={ lowerBound } 
            upperBound={ upperBound }
            sliderChange={ f => this.props.sliderChange(f, state.biggId) }
          />, 
        el)
      }
    })
    this.setState({ builder: b })
  }

  render () {
    return (
      <div className="EscherContainer" />
    )
  }
}

export default EscherContainer