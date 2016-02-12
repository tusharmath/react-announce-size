/**
 * Created by tushar.mathur on 22/12/15.
 */

'use strict'

const ReactDOM = require('react-dom')
const Rx = require('rx')
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

const rectToString = x => PROPS.map(i => x[i]).join(':')

exports.createSizeStore = exports.create = params => {
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
    getStream: () => sizeStore.distinctUntilChanged(rectToString).filter(x => x.top),
    sync: () => componentStream
  }
}
