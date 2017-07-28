import { h, Component } from 'preact';
import {Builder} from 'escher-vis';
import 'escher-vis/css/dist/builder.css'

class EscherContainer extends Component {
  shouldComponentUpdate = () => false;

  componentDidMount() {
    new Builder(null, null, null, this.base, {})
  }
  render() {
    return (
      <div className="EscherContainer" />
    );
  }
}

export default EscherContainer;