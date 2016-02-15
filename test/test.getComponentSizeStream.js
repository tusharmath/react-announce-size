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
    {top: 3, left: 0}
  ]

  const node = {
    getBoundingClientRect: x => sizes.shift()
  }

  const source = sh.createHotObservable(
    onNext(200, {}),
    onNext(201, {}),
    onNext(202, {}),
    onNext(211, {})
  )

  const ReactDOM = {findDOMNode: x => node}
  e.getComponentSizeStream(ReactDOM, source).subscribe(x => out.push(x))
  sh.start()
  t.same(out, [
    { top: 1, left: 0 },
    { top: 2, left: 0 },
    { top: 3, left: 0 }
  ])
})
