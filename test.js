/**
 * Created by tushar.mathur on 22/12/15.
 */

'use strict'
import {TestScheduler, ReactiveTest} from 'rx'
import test from 'ava'
import _ from 'lodash'
const {onNext, subscribe} = ReactiveTest

import {size, stream} from './index'

const noop = () => function () {
}
const getBoundingClientRectValues = function * () {
  const createClientRect = (i) => {
    const C = noop()
    _.assign(C.prototype, i)
    return new C()
  }
  yield * [
    createClientRect({top: 100, bottom: 100, left: 100, right: 100}),
    createClientRect({top: 101, bottom: 110, left: 100, right: 500}),
    createClientRect({top: 102, bottom: 120, left: 100, right: 100}),
    createClientRect({top: 102, bottom: 120, left: 100, right: 100}),
    createClientRect({top: 103, bottom: 120, left: 100, right: 100}),
    createClientRect({top: 104, bottom: 120, left: 100, right: 100}),
    createClientRect({top: 104, bottom: 120, left: 100, right: 100}),
    createClientRect({top: 105, bottom: 120, left: 100, right: 100}),
    createClientRect({top: 105, bottom: 120, left: 100, right: 100})
  ]
}
const createResizeStream = x => x
  .createHotObservable(
    onNext(100, null),
    onNext(200, null),
    onNext(300, null),
    onNext(400, null)
  )

test(t => {
  const out = []
  const boundingClientRect = getBoundingClientRectValues()
  const findDOMNode = () => ({
    getBoundingClientRect: () => boundingClientRect.next().value
  })
  const scheduler = new TestScheduler()
  const resize = createResizeStream(scheduler)
  const m = new (size({id: 'a', getResizeStream: () => resize, findDOMNode})(noop()))
  m.componentWillMount()
  m.componentDidMount()
  stream.subscribe(x => out.push(x))
  scheduler.startScheduler(() => resize)
  t.same(out, [
    {id: 'a', top: 100, bottom: 100, left: 100, right: 100},
    {id: 'a', top: 101, bottom: 110, left: 100, right: 500},
    {id: 'a', top: 102, bottom: 120, left: 100, right: 100},
    {id: 'a', top: 103, bottom: 120, left: 100, right: 100}
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
  const m = new (size({id: 'b', getResizeStream: () => resize, findDOMNode})(noop()))
  m.componentWillMount()
  m.componentDidMount()
  stream.subscribe(x => out.push(x))
  scheduler.advanceBy(300)
  m.componentWillUnmount()
  scheduler.advanceBy(100)
  t.same(out, [
    {id: 'b', top: 100, bottom: 100, left: 100, right: 100},
    {id: 'b', top: 101, bottom: 110, left: 100, right: 500},
    {id: 'b', top: 102, bottom: 120, left: 100, right: 100}
  ])
})
