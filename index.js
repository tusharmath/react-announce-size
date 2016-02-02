/**
 * Created by tushar.mathur on 22/12/15.
 */

'use strict'

const createStoreAsStream = require('reactive-storage').createStoreStream
const ReactDOM = require('react-dom')
const Rx = require('rx')
const Seamless = require('seamless-immutable')
const _ = require('lodash')

// TODO: Add better tests for using global functions
const defaultParams = {
  getResizeStream: () => Rx.Observable.fromEvent(window, 'resize'),
  findDOMNode: x => ReactDOM.findDOMNode(x)
}

exports.createSizeStore = exports.create = params => {
  const i = _.defaults({}, params, defaultParams)
  const sizeStore = createStoreAsStream(new Seamless({}))
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
    .subscribe(size => sizeStore.set(x => x.merge(_.pick(size, 'top', 'bottom', 'left', 'right', 'height', 'width'))))
  return {
    getStream: () => sizeStore.getStream().filter(x => x.top),
    sync: () => componentStream
  }
}
