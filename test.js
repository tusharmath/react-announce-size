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
test(t => {
  const out = []
  const changes = [
    {top: 100, bottom: 100, left: 100, right: 100},
    {top: 101, bottom: 110, left: 100, right: 500},
    {top: 102, bottom: 120, left: 100, right: 100},
    {top: 103, bottom: 120, left: 100, right: 100}
  ]
  const findDOMNode = () => ({
    getBoundingClientRect: () => changes.shift()
  })
  const scheduler = new TestScheduler()
  const resize = scheduler.createHotObservable(
    onNext(100, 100),
    onNext(200, 200),
    onNext(250, 250)
  )

  const Mock = size({id: 'a', getResizeStream: () => resize, findDOMNode})(noop)
  const m = new Mock()
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
