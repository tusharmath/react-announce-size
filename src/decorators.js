/**
 * Created by tushar.mathur on 15/02/16.
 */

'use strict'
const Rx = require('rx')
const createDeclarative = require('react-announce').createDeclarative
const PROPS = ['top', 'bottom', 'left', 'right', 'height', 'width']

const e = module.exports = (window, ReactDOM) => createDeclarative(
    function (stream, dispose) {
      dispose(e.size(ReactDOM, window, stream))
    }
)

e.pick = (ob, keys) => {
  const out = {}
  keys.forEach(x => out[x] = ob[x])
  return out
}

e.getComponent = stream => stream
    .filter(x => ['DID_MOUNT', 'DID_UPDATE'].indexOf(x.event) > -1)
    .pluck('component')

e.getWindowChangeEvents = window => Rx
    .Observable
    .combineLatest(

      Rx.Observable
        .fromEvent(window, 'resize')
        .startWith(window)
        .map(x => e.pick(x, ['innerWidth', 'innerHeight'])),

      Rx.Observable
        .fromEvent(window, 'scroll')
        .startWith(window)
        .map(x => e.pick(x, ['scrollY', 'scrollX'])),

      (size, scroll) => ({scroll, size})
)

e.getComponentSize = (ReactDOM, component, window) => component
    .combineLatest(window, x => x)
    .map(x => ReactDOM.findDOMNode(x))
    .map(x => x.getBoundingClientRect())
    .distinctUntilChanged(x => PROPS.map(p => x[p]).join(':'))

e.dispatchSize = (size, component) => size
    .withLatestFrom(component, (size, component) => ({size, component}))
    .subscribe(x => x.component.dispatch('RESIZE', x.size))

e._size = (dispatchSize, source) => dispatchSize(
    source.size.combineLatest(source.window, x => x),
    source.component
)

e.size = (ReactDOM, _window, stream) => {
  const component = e.getComponent(stream)
  const window = e.getWindowChangeEvents(_window)
  const size = e.getComponentSize(ReactDOM, component, window)
  return e._size(e.dispatchSize, {component, size, window})
}
