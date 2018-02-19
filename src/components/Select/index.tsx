import xs, {Stream} from 'xstream'
import {DOMSource} from '@cycle/dom'
import {StateSource} from 'cycle-onionify'

import {Sinks, State, Reducer} from '../../interfaces'

interface Sources {
  DOM: DOMSource;
  onion: StateSource<State>;
};

export default function Select(sources$ : Sources) : Sinks {
  return {
    DOM: view(sources$.onion.state$),
    onion: intent(sources$.DOM)
  }
}

function intent(DOM: DOMSource) {
  const defaultReducer$ = xs.of<Reducer>(prev => prev || { value : null, options : [] });

  const animalSelect$ = DOM.select('.animalSelect').events('change')
    .map(ev => state => ({ ...state, value: ev.target.value }));

  return xs.merge(defaultReducer$, animalSelect$);
}

function view(state$: Stream<State>) {

  return state$
    .map(s => s.options)
    .map(options =>
    <select className="animalSelect">
      {
        options.map(value => <option value={value}>{value}</option>)
      }
    </select>
    );
}