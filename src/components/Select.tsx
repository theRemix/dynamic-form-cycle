import xs, { Stream } from 'xstream'
import { VNode, DOMSource } from '@cycle/dom'
import { StateSource } from 'cycle-onionify'

import { Reducer, FormField, OTHER } from '../interfaces'

type Sinks = {
  DOM : Stream<VNode>;
  onion : Stream<Reducer<FormField>>;
}

type Sources = {
  DOM : DOMSource;
  onion : StateSource<FormField>;
}

function intent(DOM: DOMSource): Stream<Reducer<FormField>> {
  const defaultReducer$ = xs.of<Reducer<FormField>>(prev => prev || { value: null, options: [] });

  const select$ = DOM.select('.select').events('change')
    .map((event: Event) => (state: FormField) => ({ ...state, value: (event.target as HTMLInputElement).value }));

  const customInput$ = DOM.select('.custom-input').events('change')
    .map((event: Event) => (state: FormField) => ({ ...state, value: (event.target as HTMLInputElement).value }));

  return xs.merge(defaultReducer$, select$, customInput$);
}

function view(state$: Stream<FormField>) {
  const toOptions = ( value:string ) => ( optionValue:string ) =>
    ( optionValue === '' && value === '' ) ?
      <option disabled selected>Select Option...</option> :
      ( optionValue === value ) ?
        <option value={optionValue} selected>{optionValue}</option> :
        <option value={optionValue}>{optionValue}</option>;

  return state$
    .map(({ options, value }) => options.length > 0 ?
      <div>
        <select className="select">
          {options.map(toOptions(value))}
        </select>
        {!options.filter(o => o !== OTHER).includes(value) ? <input type="text" className="custom-input" /> : ''}
      </div> : '');
}

// video: what if the user was a function

export default function Select(sources$: Sources): Sinks {
  return {
    DOM: view(sources$.onion.state$) as Stream<VNode>,
    onion: intent(sources$.DOM)
  }
}