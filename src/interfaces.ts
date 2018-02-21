import xs from 'xstream'
import {Stream} from 'xstream'
import {DOMSource, VNode} from '@cycle/dom'
import {HTTPSource, Response} from '@cycle/http'

export const OTHER = 'Other...';

export type FormField = {
  value: string,
  options: Array<string>
}

export type Reducer<S> = (prev: S) => S