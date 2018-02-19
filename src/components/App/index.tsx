import xs, {Stream, MemoryStream} from 'xstream'
import { VNode, DOMSource } from '@cycle/dom'
import isolate from '@cycle/isolate'

import {Sources, Sinks, State} from '../../interfaces'
import Select from '../Select'

function defaultReducer (prev: State): State {
  return (typeof prev === 'undefined') ? {
    animal: {
      value: null,
      options: ['bird','cat','dog']
    },
    noise: {
      value: null,
      options: []
    }
  } : prev
}

function intent (DOM: DOMSource): Stream<number> {
  return DOM.select('.incrementer').events('change').map(ev => parseInt(ev.target.value) || 0)
}

function model (action$: Stream<number>): Stream<Reducer> {
  const defaultReducer$ = xs.of(defaultReducer);

  // everytime action$ emits, addOneReducer triggers
  const addOneReducer$ = xs.combine(action$, xs.periodic(1000))
    .map(([num, i]) => function addOneReducer(prev) { 
      return { ...prev, bigCount : prev.bigCount + num }; });

  return xs.merge(defaultReducer$, addOneReducer$);
}

function view(state$: MemoryStream<State>, animalSelect$: Stream<VNode>, noiseSelect$: Stream<VNode>): Stream<VNode>{
  return xs.combine(state$, animalSelect$, noiseSelect$).map(([ state, animalSelect, noiseSelect ]) =>
    <div>
      <h2>{state.animal.value}</h2>
      {animalSelect}
    </div>
  );
}

export default function App(sources$ : Sources) : Sinks {
  const animalSelect = isolate(Select, 'animal')(sources$)
  const noiseSelect = isolate(Select, 'noise')(sources$)
  const state$ = sources$.onion.state$
  const action$ = intent(sources$.DOM)
  const reducer$ = model(action$)
  const vdom$ = view(state$, animalSelect.DOM, noiseSelect.DOM)

  return {
    DOM: vdom$,
    onion: xs.merge(reducer$, animalSelect.onion, noiseSelect.onion)
  }
}