/**
 * Created by tushar.mathur on 22/12/15.
 */

'use strict'
import {TestScheduler, ReactiveTest} from 'rx'
import test from 'ava'
const {onNext} = ReactiveTest

import {create, createSizeStore} from './../index'

const noop = () => function () {
}
const getBoundingClientRectValues = function * () {
  const createClientRect = (i) => {
    const C = noop()
    Object.assign(C.prototype, i)
    return new C()
  }
  yield * [
    createClientRect({top: 100, bottom: 100, left: 100, right: 100}),
    createClientRect({top: 101, bottom: 110, left: 101, right: 500}),
    createClientRect({top: 102, bottom: 120, left: 102, right: 100}),
    createClientRect({top: 102, bottom: 120, left: 102, right: 100}),
    createClientRect({top: 103, bottom: 120, left: 104, right: 100}),
    createClientRect({top: 104, bottom: 120, left: 105, right: 100}),
    createClientRect({top: 104, bottom: 120, left: 106, right: 100}),
    createClientRect({top: 105, bottom: 120, left: 107, right: 100}),
    createClientRect({top: 105, bottom: 120, left: 108, right: 100})
  ]
}

test(t => {
  const out = []
  const boundingClientRect = getBoundingClientRectValues()
  const findDOMNode = () => ({
    getBoundingClientRect: () => boundingClientRect.next().value
  })
  const scheduler = new TestScheduler()
  const resize = scheduler.createHotObservable(
    onNext(100, null),
    onNext(200, null),
    onNext(300, null),
    onNext(400, null)
  )
  const store = create({getResizeStream: () => resize, findDOMNode})
  store.sync().onNext({event: 'WILL_MOUNT'})
  store.sync().onNext({event: 'DID_MOUNT'})
  store.getStream().subscribe(x => out.push(x))
  scheduler.start()
  t.same(out, [
    {top: 100, bottom: 100, left: 100, right: 100},
    {top: 101, bottom: 110, left: 101, right: 500},
    {top: 102, bottom: 120, left: 102, right: 100},
    {top: 103, bottom: 120, left: 104, right: 100}
  ])
})

test('unmount', t => {
  const out = []
  const boundingClientRect = getBoundingClientRectValues()
  const findDOMNode = () => ({
    getBoundingClientRect: () => boundingClientRect.next().value
  })
  const scheduler = new TestScheduler()
  const resize = scheduler.createHotObservable(
    onNext(100),
    onNext(200),
    onNext(300),
    onNext(500),
    onNext(600),
    onNext(700),
    onNext(800),
    onNext(900)
  )
  const store = create({getResizeStream: () => resize, findDOMNode})
  store.getStream().subscribe(x => out.push(x))
  store.sync().onNext({event: 'WILL_MOUNT'})
  store.sync().onNext({event: 'DID_MOUNT'})
  scheduler.advanceBy(300)
  store.sync().onNext({event: 'WILL_UNMOUNT'})
  scheduler.advanceBy(300)
  store.sync().onNext({event: 'WILL_MOUNT'})
  scheduler.advanceBy(300)
  t.same(out, [
    {top: 100, bottom: 100, left: 100, right: 100},
    {top: 101, bottom: 110, left: 101, right: 500},
    {top: 102, bottom: 120, left: 102, right: 100},
    {top: 104, bottom: 120, left: 106, right: 100},
    {top: 105, bottom: 120, left: 107, right: 100},
    {top: 105, bottom: 120, left: 108, right: 100}
  ])
})

test('alias:createSizeStore', t => {
  t.is(create, createSizeStore)
})
