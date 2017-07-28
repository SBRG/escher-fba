import { h, Component } from 'preact';
import {Builder} from 'escher-vis';
import 'escher-vis/css/dist/builder.css';
import model from './E coli core.json';
import map from './E coli core.Core metabolism.json';

class EscherContainer extends Component {
  shouldComponentUpdate = () => false;

  componentWillReceiveProps(nextProps) {
    
  }

  componentDidMount() {
    new Builder(map, model, null, this.base, {})
  }

  setReactionData(result) {
    if (result.f < 1e-3) {
      this.set_reaction_data(null);
    } else {
      this.set_reaction_data(result.x);
    }
  }

  render() {
    return (
      <div className="EscherContainer" />
    );
  }
}

export default EscherContainer;