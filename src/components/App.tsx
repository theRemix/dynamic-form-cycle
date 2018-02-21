import xs, {Stream, MemoryStream} from 'xstream'
import sampleCombine from 'xstream/extra/sampleCombine'
import {VNode, DOMSource} from '@cycle/dom'
import {HTTPSource} from '@cycle/http'
import isolate from '@cycle/isolate'
import {StateSource} from 'cycle-onionify'

import {Reducer, FormField, OTHER} from '../interfaces'
import Select from './Select'

type State = {
  animal: FormField;
  noise: FormField;
}

type Sinks = {
  DOM : Stream<VNode>;
  HTTP : Stream<any>;
  onion : Stream<Reducer<State>>;
}

type Sources = {
  DOM : DOMSource;
  HTTP : Response;
  onion : StateSource<State>;
}

const animalNoises:any = {
  bird : ['', 'tweet', 'chirp'],
  cat  : ['', 'meow', 'nyu', OTHER],
  dog : ['', 'arf', 'ruff', OTHER]
}

function defaultReducer (prev: State): State {
  return (typeof prev === 'undefined') ? {
    animal: {
      value: '',
      options: ['', ...Object.keys(animalNoises)]
    },
    noise: {
      value: '',
      options: []
    }
  } : prev
}

function intent (sources$: Sources) {
  return sources$.DOM.select('form')
    .events('submit', { preventDefault : true })
    .compose(sampleCombine(sources$.onion.state$))
    .map(([ event, state ]) => ({
      url: '/api/endpoint',
      category: 'Form',
      method: 'POST',
      type: 'application/json',
      send: {
        animal : state.animal.value,
        noise : state.noise.value
      }
    }))
}

function model (): Stream<Reducer<State>> {
  return xs.of(defaultReducer);
}

function view(state$: MemoryStream<State>, animalSelect$: Stream<VNode>, noiseSelect$: Stream<VNode>): Stream<VNode>{
  return xs.combine(state$, animalSelect$, noiseSelect$).map(([ state, animalSelect, noiseSelect ]) =>
    <form className="pure-form">
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
    get: (state:any) => ({...state.animal}),
    set: (state:State, childState:FormField) => ({
        ...state, 
        animal: { ...childState }, 
        noise: { ...state.noise, value : '', options : animalNoises[childState.value] }
    })
  };
  const animalSelect = isolate(Select, { onion : animalLens })(sources$)
  const noiseSelect = isolate(Select, 'noise')(sources$)
  const action$ = intent(sources$)
  const reducer$ = model()
  const state$ = sources$.onion.state$
  const vdom$ = view(state$, animalSelect.DOM, noiseSelect.DOM)

  return {
    DOM: vdom$ as Stream<VNode>,
    HTTP: action$,
    onion: xs.merge(reducer$, animalSelect.onion, noiseSelect.onion) as Stream<Reducer<State>>,
  }
}