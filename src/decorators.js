/**
 * Created by tushar.mathur on 15/02/16.
 */

'use strict'
const Rx = require('rx')
const createDeclarative = require('react-announce').createDeclarative
const PROPS = ['top', 'bottom', 'left', 'right', 'height', 'width']

// TODO : Create another package
const targs = function () {
  const toArr = x => [].slice.call(x)
  const keys = toArr(arguments)
  return function () {
    const out = {}
    const values = toArr(arguments)
    values.forEach((x, i) => out[keys[i]] = x)
    return out
  }
}

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

      targs('size', 'scroll')
)

e.getComponentSizeFromDom = (ReactDOM, component) => ReactDOM
    .findDOMNode(component)
    .getBoundingClientRect()

e.getComponentSize = (ReactDOM, component, window) => component
    .combineLatest(window, targs('component', 'window'))
    .map(x => ({
        rect: e.getComponentSizeFromDom(ReactDOM, x.component),
        window: x.window
    }))
    .distinctUntilChanged(x => PROPS.map(p => x.rect[p]).join(':'))

e.dispatchSize = (size, component) => size
    .withLatestFrom(component, (size, component) => ({size, component}))
    .subscribe(x => x.component.dispatch('RESIZE', x.size.rect, x.size.window.size, x.size.window.scroll))

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
