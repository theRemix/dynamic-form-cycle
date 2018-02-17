import {run} from '@cycle/run'
import {makeDOMDriver} from '@cycle/dom'
import onionify from 'cycle-onionify';

import App from './components/App'

const main = onionify(App)

const drivers : any = {
  DOM: makeDOMDriver('#root')
}

run(main, drivers)
