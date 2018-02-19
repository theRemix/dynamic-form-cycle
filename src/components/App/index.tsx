import xs, {Stream, MemoryStream} from 'xstream'
import {VNode} from '@cycle/dom'
import isolate from '@cycle/isolate'

import {Sources, Sinks, Reducer, FormField} from '../../interfaces'
import Select from '../Select'

type State = {
  animal: FormField;
  noise: FormField;
}

const animalNoises:any = {
  bird : ['tweet', 'chirp'],
  cat  : ['meow', 'nyu'],
  dog : ['arf', 'ruff']
}

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

function model (): Stream<Reducer<State>> {
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

export default function App(sources$ : Sources<State>) : Sinks<State> {
  const animalLens = {
    get: (state:any) => ({...state.animal}),
    set: (state:State, childState:any) => ({
        ...state, 
        animal: { ...childState }, 
        noise: { ...state.noise, value : '', options : animalNoises[childState.value] }
    })
  };
  const animalSelect = isolate(Select, { onion : animalLens })(sources$)
  const noiseSelect = isolate(Select, 'noise')(sources$)
  const state$ = sources$.onion.state$
  const reducer$ = model()
  const vdom$ = view(state$, animalSelect.DOM, noiseSelect.DOM)

  return {
    DOM: vdom$ as Stream<VNode>,
    onion: xs.merge(reducer$, animalSelect.onion, noiseSelect.onion) as Stream<Reducer<State>>
  }
}