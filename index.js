/**
 * Created by tushar.mathur on 22/12/15.
 */

'use strict'

const createDeclarative = require('react-announce').createDeclarative
const createStoreAsStream = require('reactive-storage').createStoreAsStream
const ReactDOM = require('react-dom')
const Rx = require('rx')
const Seamless = require('seamless-immutable')
const _ = require('lodash')

const getResizeStream = () => Rx.Observable.fromEvent(window, 'resize')
const defaultParams = {
  debounce: 0,
  getResizeStream,
  findDOMNode: x => ReactDOM.findDOMNode(x)
}

const globalStream = new Rx.BehaviorSubject({})
exports.stream = globalStream
exports.size = createDeclarative(function (componentStream, dispose, params) {
  const i = _.defaults(params, defaultParams)
  const sizeStore = createStoreAsStream(new Seamless({id: i.id, top: null, bottom: null, left: null, right: null}))
  const didMount = componentStream.filter(x => x.event === 'DID_MOUNT')
  const didUpdate = componentStream.filter(x => x.event === 'DID_UPDATE')
  const resizeStream = i.getResizeStream().startWith({})
  sizeStore.getStream()
    .subscribe(x => globalStream.onNext(x))
  dispose(
    Rx.Observable
      .merge(didMount, didUpdate)
      .map(() => i.findDOMNode(this))
      .combineLatest(resizeStream, (a, b) => a.getBoundingClientRect())
      .subscribe(size => sizeStore.update(x => x.merge(size)))
  )
})
