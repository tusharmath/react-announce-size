/**
 * Created by tushar.mathur on 22/12/15.
 */

'use strict'

const createDeclarative = require('react-announce').createDeclarative
const createStoreAsStream = require('reactive-storage').createStoreAsStream
const Rx = require('rx')
const Seamless = require('seamless-immutable')
const _ = require('lodash')
const Subject = Rx.BehaviorSubject

const defaultParams = {
  getResizeStream: () => Rx.Observable.fromEvent(window, 'resize'),
  findDOMNode: x => require('react-dom').findDOMNode(x)
}

const globalStream = new Subject()
exports.stream = globalStream
exports.size = createDeclarative(function (componentStream, dispose, params) {
  const i = _.defaults(params, defaultParams)
  const sizeStore = createStoreAsStream(new Seamless({id: i.id}))
  const didMount = componentStream.filter(x => x.event === 'DID_MOUNT')
  const didUpdate = componentStream.filter(x => x.event === 'DID_UPDATE')
  const resizeStream = i.getResizeStream().startWith({})
  dispose(
    sizeStore.getStream().subscribe(globalStream),
    Rx.Observable
      .merge(didMount, didUpdate)
      .map(() => i.findDOMNode(this))
      .combineLatest(resizeStream, (a, b) => a.getBoundingClientRect())
      .subscribe(size => sizeStore.update(x => x.merge(size)))
  )
})
