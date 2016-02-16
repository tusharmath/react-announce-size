import { TestScheduler, ReactiveTest } from 'rx'
import test from 'ava'
const {onNext} = ReactiveTest

import e from '../src/decorators'

const createWindow = () => {
  const listeners = []

  return {
    listeners,
    addEventListener: (ev, cb) => listeners.push({ev, cb}),
    innerWidth: 100,
    innerHeight: 200,
    scrollX: 9000,
    scrollY: 9001
  }
}

test(t => {
  const sh = new TestScheduler()
  const ReactDOM = {}
  const window = createWindow()
  const stream = sh.createHotObservable()
  e.size(ReactDOM, window, stream)
})

test('getWindowChangeEvents', t => {
  const out = []
  const window = createWindow()
  e.getWindowChangeEvents(window).subscribe(x => out.push(x))
  t.same(out, [
    {
      scroll: {scrollX: 9000, scrollY: 9001},
      size: {innerWidth: 100, innerHeight: 200}
    }
  ])
})

test('getComponentSize', t => {
  const rects = [
    {top: 1, left: 100},
    {top: 2, left: 100},
    {top: 2, left: 100}
  ]
  const ReactDOM = {findDOMNode: () => ({getBoundingClientRect: () => rects.shift()})}
  const out = []
  const sh = new TestScheduler()
  const component = sh.createHotObservable(
    onNext(211, 'A')
  )
  const window = sh.createHotObservable(
    onNext(215, 'B'),
    onNext(225, 'B'),
    onNext(235, 'B')
  )
  e.getComponentSize(ReactDOM, component, window).subscribe(x => out.push(x))
  sh.start()
  t.same(out, [
    { top: 1, left: 100 },
    { top: 2, left: 100 }
  ])
})
