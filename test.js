/**
 * Created by tushar.mathur on 22/12/15.
 */

'use strict'
import {TestScheduler, ReactiveTest} from 'rx'
import test from 'ava'
const {onNext} = ReactiveTest

import {size, stream} from './index'

const noop = function () {
}
const getBoundingClientRectValues = function * () {
  yield * [
    {top: 100, bottom: 100, left: 100, right: 100},
    {top: 101, bottom: 110, left: 100, right: 500},
    {top: 102, bottom: 120, left: 100, right: 100},
    {top: 102, bottom: 120, left: 100, right: 100},
    {top: 103, bottom: 120, left: 100, right: 100}
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
  const m = new (size({id: 'a', getResizeStream: () => resize, findDOMNode})(noop))
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
