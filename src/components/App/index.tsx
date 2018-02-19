import xs, {Stream, MemoryStream} from 'xstream'
import { VNode, DOMSource } from '@cycle/dom'
import isolate from '@cycle/isolate'

import {Sources, Sinks, State} from '../../interfaces'
import Select from '../Select'

const animalNoises = {
  bird : ['tweet', 'chirp'],
  cat  : ['meow', 'nyu'],
  dog : ['arf', 'ruff']
};

function defaultReducer (prev: State): State {
  return (typeof prev === 'undefined') ? {
    animal: {
      name: 'animal',
      value: '',
      options: Object.keys(animalNoises)
    },
    noise: {
      name: 'noise',
      value: '',
      options: []
    }
  } : prev
}

function model (action$: Stream<State>): Stream<Reducer> {
  return xs.of(defaultReducer);
}

function view(state$: MemoryStream<State>, animalSelect$: Stream<VNode>, noiseSelect$: Stream<VNode>): Stream<VNode>{
  return xs.combine(state$, animalSelect$, noiseSelect$).map(([ state, animalSelect, noiseSelect ]) =>
    <form className="pure-form" action="http://postb.in/KFr1UPBm" method="POST">
      <code><pre>payload : {JSON.stringify({
        animal : state.animal.value,
        noise : state.noise.value
      })}</pre></code>
      <div>
        {animalSelect}
      </div>
      <div>
        {noiseSelect}
      </div>
      <div>
        { state.noise.value !== '' ? 
          <button className="pure-button pure-button-primary">Submit</button> : '' }
      </div>
    </form>
  );
}

export default function App(sources$ : Sources) : Sinks {
  const animalLens = {
    get: state => ({...state.animal}),
    set: (state, childState) => ({
        ...state, 
        animal: { ...childState }, 
        noise: { ...state.noise, value : '', options : animalNoises[childState.value] }
    })
  };
  const animalSelect = isolate(Select, { onion : animalLens })(sources$)
  const noiseSelect = isolate(Select, 'noise')(sources$)
  const state$ = sources$.onion.state$
  const reducer$ = model(sources$.DOM)
  const vdom$ = view(state$, animalSelect.DOM, noiseSelect.DOM)

  return {
    DOM: vdom$,
    onion: xs.merge(reducer$, animalSelect.onion, noiseSelect.onion)
  }
}