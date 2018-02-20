import xs from 'xstream'
import {Stream} from 'xstream'
import {DOMSource, VNode} from '@cycle/dom'
import {StateSource} from 'cycle-onionify'

export const OTHER = 'Other...';

export type FormField = {
  value: string,
  options: Array<string>
}

export type Reducer<S> = (prev: S) => S

export type Sources<S> = {
  DOM : DOMSource;
  onion : StateSource<S>;
}

export type Sinks<S> = {
  DOM : Stream<VNode>;
  onion : Stream<Reducer<S>>;
}
