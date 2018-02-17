import xs, {Stream} from 'xstream'
import {DOMSource} from '@cycle/dom'
import {StateSource} from 'cycle-onionify'

import {Sinks, State, Reducer} from '../../interfaces'

interface Sources {
  DOM: DOMSource;
  onion: StateSource<State>;
};

export default function Select(sources : Sources) : Sinks {

  // const vtree$ = xs.of(
  //   <select>
  //     {

  //     }
  //     <option value={}>{}</option>
  //   </select>
  // )

  return {
    DOM: view(sources.onion.state$),
    onion: intent(sources.DOM)
  }
}

function intent(DOM: DOMSource) {
  const defaultReducer$ = xs.of<Reducer>(prev => prev || { count: 5 });

  const add$ = DOM.select('.add').events('click')
    .mapTo<Reducer>(state => ({ ...state, count: state.count + 1 }));

  const subtract$ = DOM.select('.subtract').events('click')
    .mapTo<Reducer>(state => ({ ...state, count: Math.max(state.count - 1, 0) }));

  return xs.merge(defaultReducer$, add$, subtract$);
}

function view(state$: Stream<State>) {
  return state$
    .map(s => s.count)
    .map(count =>
      <div>
        <p>Counter: {count}</p>
        <p>
          <button type='button' className='pure-button add'>Increase</button>
        </p>
        <p>
          <button type='button' className='pure-button subtract'>Decrease</button>
        </p>
      </div>
    );
}