import xs from 'xstream'
import {Stream} from 'xstream'
import {DOMSource, VNode} from '@cycle/dom'
import {StateSource} from 'cycle-onionify'

export type State = {
  count : number;
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
