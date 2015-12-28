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
const defaultParams = {
  getResizeStream: () => Rx.Observable.fromEvent(window, 'resize'),
  findDOMNode: x => ReactDOM.findDOMNode(x)
}

exports.createSizeStore = () => {
  const sizeStore = createStoreAsStream(new Seamless({}))
  return {
    getStream: () => sizeStore.getStream(),
    update: size => sizeStore.update(x => x.merge(_.pick(size, 'top', 'bottom', 'left', 'right', 'height', 'width')))
  }
}

exports.size = createDeclarative(function (componentStream, dispose, params) {
  const i = _.defaults(params, defaultParams)
  const didMount = componentStream.filter(x => x.event === 'DID_MOUNT')
  const didUpdate = componentStream.filter(x => x.event === 'DID_UPDATE')
  const resizeStream = i.getResizeStream().startWith({})
  dispose(
    Rx.Observable
      .merge(didMount, didUpdate)
      .map(() => i.findDOMNode(this))
      .combineLatest(resizeStream, (a, b) => a.getBoundingClientRect())
      .subscribe(params.store.update)
  )
})
