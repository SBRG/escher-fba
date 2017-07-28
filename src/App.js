import { h, Component } from 'preact';
import logo from './logo.svg';
import './App.css';
import {MultiSlider} from 'preact-range-slider';
import 'preact-range-slider/assets/index.css';
import EscherContainer from './EscherContainer.js';
import FBA from './FBA.js';
import model from './E coli core.json';

class App extends Component {
  componentDidMount() {
    const fba = new FBA()
    var result = fba.build_and_solve(model)
    
  }
  render() {
    return (
      <div className="App">
         <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Hello World</h2>
        </div>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p> 
        <div className="Slider">
          <MultiSlider
          min={-1000}
          max={1000}
          defaultValue={[0,1000]}
          allowCross={false}
          pushable={1}
          //onAfterChange={(value)=>[min, max]}
          />
        </div>
        <EscherContainer />
      </div>
    );
  }
}

export default App;