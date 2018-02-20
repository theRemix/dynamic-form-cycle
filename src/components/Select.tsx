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
    .map(({ name, options, value }) => options.length > 0 ?
      <select name={name} className="select">
        {options.map( optionValue => optionValue === '' && value === '' ?
            <option disabled selected>Select Option...</option> :
            optionValue === value ?
              <option value={optionValue} selected>{optionValue}</option> :
              <option value={optionValue}>{optionValue}</option>
          )
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