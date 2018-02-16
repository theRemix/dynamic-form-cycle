import xs, { Stream } from 'xstream'
import { VNode } from '@cycle/dom';
import isolate from '@cycle/isolate'
import {Sources, Sinks} from '../../interfaces'

import Select from '../Select'

export default function App(sources : Sources) : Sinks {
  const select = isolate(Select)(sources);
  return {
    DOM: view(select.DOM),
  }
}

function view(select: Stream<VNode>) {
  return xs.combine(select)
    .map(([select]) =>
      <div>
        My Awesome Cycle.js app
        {select}
      </div>
    );
}