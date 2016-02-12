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

// TODO: Add better tests for using global functions

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

e.getComponentSizeStream = (ReactDOM, resize, component) => component
    .combineLatest(resize, a => a)
    .map(x => ReactDOM.findDOMNode(x).getBoundingClientRect())
    .distinctUntilChanged(e.rectToString)

e.dispatchSize = x => x.component.dispatch('RESIZE', x.size)

e.bindToStream = (d, stream, window) => {
  const resize = d.getResizeStream(window)
  const component = e.getComponentStream(stream)
  const componentSizeStream = e.getComponentSizeStream(d.ReactDOM, resize, component)
  return componentSizeStream.withLatestFrom(component, e.select)
    .subscribe(d.dispatchSize)
}

e.size = createDeclarative(function (stream, dispose, window) {
  dispose(bindToStream(e, stream, window))
})

// TODO: Deprecate functionality
e.createSizeStore = e.create = params => {
  const i = Object.assign({}, defaultParams, params)
  const sizeStore = new Rx.BehaviorSubject({})
  const componentStream = new Rx.Subject()
  const didMount = componentStream.filter(x => x.event === 'DID_MOUNT')
  const didUpdate = componentStream.filter(x => x.event === 'DID_UPDATE')
  const resizeStream = i.getResizeStream().startWith({})

  Rx.Observable
    .merge(didMount, didUpdate)
    .map(x => i.findDOMNode(x.component))
    .combineLatest(resizeStream, a => a.getBoundingClientRect())
    .withLatestFrom(componentStream.pluck('event'), (size, event) => ({size, event}))
    .filter(x => x.event !== 'WILL_UNMOUNT')
    .pluck('size')
    .subscribe(size => sizeStore.onNext(pick(size, PROPS)))
  return {
    getStream: () => sizeStore.distinctUntilChanged(e.rectToString).filter(x => x.top),
    sync: () => componentStream
  }
}
