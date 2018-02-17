import {run} from '@cycle/run'
import {makeDOMDriver} from '@cycle/dom'
import onionify from 'cycle-onionify';

import {Component} from './interfaces'
import App from './components/App'

const main : Component = onionify(App, 'onion')

const drivers:any = {
  DOM: makeDOMDriver('#root'),
}

run(main, drivers)
