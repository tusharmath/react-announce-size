/**
 * Created by tushar.mathur on 22/12/15.
 */

'use strict'
const e = exports
const ReactDOM = require('react-dom')
e.ReactDOM = ReactDOM
const Rx = require('rx')
const createDeclarative = require('react-announce').createDeclarative
const PROPS = ['top', 'bottom', 'left', 'right', 'height', 'width']
// TODO: Remove the word STREAM from all functions and file names

const defaultParams = {
  getResizeStream: () => Rx.Observable.fromEvent(window, 'resize'),
  findDOMNode: x => ReactDOM.findDOMNode(x)
}

const pick = (obj, keys) => {
  const out = {}
  keys
    .filter(x => obj[x])
    .forEach(x => out[x] = obj[x])
  return out
}

e.select = (size, component) => ({size, component})

e.rectToString = x => PROPS.map(i => x[i]).join(':')

e.getComponentStream = x => x
    .filter(x => ['DID_MOUNT', 'DID_UPDATE'].indexOf(x.event) > -1)
    .pluck('component')

e.getResizeStream = window => Rx.Observable.fromEvent(window, 'resize')
e.getScrollStream = window => Rx.Observable.fromEvent(window, 'scroll')

e.createComponent = function () {
  const streams = [].slice.call(arguments)
  return Rx.Observable.combineLatest.apply(null, streams, x => x)
}

e.getComponentSizeStream = (ReactDOM, component) => component
    .map(x => ReactDOM.findDOMNode(x).getBoundingClientRect())
    .distinctUntilChanged(e.rectToString)

e.dispatchSize = x => x.component.dispatch('RESIZE', x.size)

e.getSourceStreams = (d, stream, window) => {
  const resize = d.getResizeStream(window).startWith({})
  const component = e.getComponentStream(stream)
  return {resize, component}
}

e.bindToStream = (d, stream, window) => {
  const src = e.getSourceStreams(d, stream, window)
  const consolidatedStreams = e.createComponent(src.component, src.resize)
  const componentSizeStream = e.getComponentSizeStream(d.ReactDOM, consolidatedStreams)
  return componentSizeStream.withLatestFrom(src.component, e.select)
    .subscribe(d.dispatchSize)
}

e.declarative = function (stream, dispose, window) {
  dispose(e.bindToStream(e, stream, window))
}

e.size = createDeclarative(e.declarative)
