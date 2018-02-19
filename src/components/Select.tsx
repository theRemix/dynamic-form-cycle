import xs, {Stream} from 'xstream'
import {VNode, DOMSource} from '@cycle/dom'
import {StateSource} from 'cycle-onionify'

import {Sinks, Sources, Reducer, FormField} from '../interfaces'

function intent(DOM: DOMSource): Stream<Reducer<FormField>> {
  const defaultReducer$ = xs.of<Reducer<FormField>>(prev => prev || { name : '', value : null, options : [] });

  const select$ = DOM.select('.select').events('change')
    .map(( event:Event ) => ( state:FormField ) => ({ ...state, value: (event.target as HTMLInputElement).value }));

  return xs.merge(defaultReducer$, select$);
}

function view(state$: Stream<FormField>) {
  return state$
    .map(({ name, options }) => options.length ? 
      <select name={name} className="select">
        <option disabled selected>Select Option...</option>
        {
          options.map(value => <option value={value}>{value}</option>)
        }
      </select> : ''
    );
}

export default function Select(sources$ : Sources<FormField>) : Sinks<FormField> {
  return {
    DOM: view(sources$.onion.state$) as Stream<VNode>,
    onion: intent(sources$.DOM)
  }
}