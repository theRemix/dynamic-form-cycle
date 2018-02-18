import xs, {Stream, MemoryStream} from 'xstream'
import { VNode, DOMSource } from '@cycle/dom'
import isolate from '@cycle/isolate'

import {Sources, Sinks, State} from '../../interfaces'
import Select from '../Select'

function defaultReducer (prev: State): State {
  return (typeof prev === 'undefined') ? {
    bigCount: 100,
    childCount: {
      count: 0
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

function view(state$: MemoryStream<State>, select$: Stream<VNode>): Stream<VNode>{
  return xs.combine(state$, select$).map(([ state, select ]) =>
    <div>
      <div>
        App Counter { state.bigCount }
      </div>
      <div>
        <input type="text" className="incrementer" placeholder="incrementer" />
      </div>

      {select}
    </div>
  );
}

export default function App(sources$ : Sources) : Sinks {
  const select = isolate(Select, 'childCount')(sources$)
  const state$ = sources$.onion.state$
  const action$ = intent(sources$.DOM)
  const reducer$ = model(action$)
  const vdom$ = view(state$, select.DOM)

  return {
    DOM: vdom$,
    onion: xs.merge(reducer$, select.onion)
  }
}