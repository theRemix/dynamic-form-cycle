import xs, { Stream } from 'xstream'
import { VNode } from '@cycle/dom'
import isolate from '@cycle/isolate'
import {StateSource} from 'cycle-onionify'

import {Sinks} from '../../interfaces'
import Select from '../Select'

interface Sources {
  DOM: DOMSource;
  onion: StateSource<any>;
};

export default function App(sources : Sources) : Sinks {
  // const state$ = sources.onion.state$;

  const initialReducer$ = xs.of(function initialReducer() { 
    return { count : 0 }; 
  });
  const addOneReducer$ = xs.periodic(1000)
    .mapTo(function addOneReducer(prev) { return { count : prev.count + 1 }; });
  const reducer$ = xs.merge(initialReducer$, addOneReducer$);

  const select = isolate(Select)(sources);
  return {
    DOM: view(select.DOM),
    onion: xs.merge(select.onion),
  }
}

function view(select$: Stream<VNode>) {
  return select$.map(select =>
    <div>
      My Awesome Cycle.js app
      {select}
    </div>
  );
}