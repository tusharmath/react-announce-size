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

test('size', t => {
  const sh = new TestScheduler()
  const ReactDOM = {}
  const window = createWindow()
  const stream = sh.createHotObservable()
  const mock = () => null
  const a = e(ReactDOM, window, stream)(mock)
  t.is(a, mock)
})

test('size', t => {
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
    onNext(215, 'B0'),
    onNext(225, 'B1'),
    onNext(235, 'B2')
  )
  e.getComponentSize(ReactDOM, component, window).subscribe(x => out.push(x))
  sh.start()
  t.same(out, [
    {window: 'B0', rect: { top: 1, left: 100 }}  ,
    {window: 'B1', rect: { top: 2, left: 100 }}
  ])
})

test('dispatchSize', t => {
  const out = []
  function dispatch (event, rect, size, scroll) {out.push({event, rect, size, scroll})}
  const sh = new TestScheduler()
  const size = sh.createHotObservable(
    onNext(230, {rect: 'rect0', window: {scroll: 'scroll0', size: 'size0'}}),
    onNext(240, {rect: 'rect1', window: {scroll: 'scroll1', size: 'size1'}})
  )
  const component = sh.createHotObservable(
    onNext(210, {dispatch})
  )
  e.dispatchSize(size, component)
  sh.start()
  t.same(out, [
    {event: 'RESIZE', rect: 'rect0', scroll: 'scroll0', size: 'size0'},
    {event: 'RESIZE', rect: 'rect1', scroll: 'scroll1', size: 'size1'}
  ])
})
