import xs from 'xstream'
import {Stream} from 'xstream'
import {DOMSource, VNode} from '@cycle/dom'
import {StateSource} from 'cycle-onionify'

type FormField = {
  name: string,
  value: string,
  options: Array<string>
}

export type State = {
  animal: FormField;
  noise: FormField;
}

export type Reducer = (prev: State) => State

export type Sources = {
  DOM : DOMSource;
  onion : StateSource<State>;
}

export type Sinks = {
  DOM : Stream<VNode>;
  onion : Stream<Reducer>;
}

export type Component = (s : Sources) => Sinks;
