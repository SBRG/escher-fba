/** @jsx h */

import { h, Component } from 'preact'

class Help extends Component {
  render () {
    return (
      <div>
        <h2>Escher-FBA Instructions</h2>

        <p>
          Try it out by mousing over a reaction label and using the buttons
          within the tooltip! The upper and lower bounds can also be changed by
          adjusting the slider bars or by entering values in the Upper Bound and
          Lower Bound fields. Please note that while you can set any number of
          reactions to be maximized or minimized, at least one needs to be set.
        </p>

        <br/>

        <p>
          The <button className='demoButton'>Knockout</button> button sets both
          the upper and lower bounds of the reaction to zero, simulating a
          knockout of the targeted gene.
        </p>

        <p>
          The <button className='demoButton'>Reset</button> button resets the
          upper and lower bounds of the reaction to their original values in the
          loaded model.
        </p>

        <p>
          The <button className='demoButton'>Maximize</button> button tells the
          problem solver to set the objective function to maximize the amount of
          flux through the target reaction.
        </p>

        <p>
          The opposite of the maximize button,
          the <button className='demoButton'>Minimize</button> button sets the
          objective function to minimize the amount of flux through the target
          reaction.
        </p>

        <h2>About Escher</h2>

        <p>
          The rest of the functionality in Escher-FBA is provided by the Escher
          pathway visualization software. To learn more about Escher, visit
          the <a href='https://escher.github.io/'>Escher homepage</a> or
          check out the <a href='https://escher.readthedocs.io'>Documentation</a>.
        </p>

        <h2>How to cite</h2>

        <p>
          You can support Escher-FBA by citing our preprint:
        </p>

        <p>
          EG Rowe, BO Palsson, ZA King. <b>Escher-FBA: A web application for interactive flux balance analysis</b>.
          bioRxiv 281600; <a href='https://doi.org/10.1101/281600'>https://doi.org/10.1101/281600</a>.
        </p>
      </div>
    )
  }
}

export default Help
