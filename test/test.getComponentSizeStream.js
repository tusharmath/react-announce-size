import { TestScheduler, ReactiveTest } from 'rx'
import test from 'ava'
const {onNext} = ReactiveTest

import e from '../index'

test(t => {

  const out = []
  const window = {}
  const sh = new TestScheduler()
  const sizes = [
    {top: 1, left: 0},
    {top: 2, left: 0},
    {top: 2, left: 0},
    {top: 3, left: 0},
    {top: 4, left: 0}
  ]
  const node = {
    getBoundingClientRect: x => sizes.shift()
  }
  const resize = sh.createHotObservable(
    onNext(200, {}),
    onNext(201, {}),
    onNext(202, {}),
    // fired after component mounts
    onNext(211, {}),
    onNext(220, {}),
    onNext(230, {})
  )
  const component = sh.createHotObservable(
    // fired once
    onNext(210, {props: 0})
  )

  const ReactDOM = {findDOMNode: x => node}
  e.getComponentSizeStream(ReactDOM, resize, component)
    .subscribe(x => out.push(x))
  sh.start()
  t.same(out, [
    { top: 1, left: 0 },
    { top: 2, left: 0 },
    { top: 3, left: 0 }
  ])
})
