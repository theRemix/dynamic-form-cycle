import xs from 'xstream'
import {Sources, Sinks} from '../../interfaces'

export default function Select(sources : Sources) : Sinks {
  const vtree$ = xs.of(
    <div>
      <h2>Select Component</h2>
    </div>
  )

  return {
    DOM: vtree$
  }
}
