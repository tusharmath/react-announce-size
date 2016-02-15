import { TestScheduler, ReactiveTest } from 'rx'
import test from 'ava'
const {onNext} = ReactiveTest

import e from '../src/decorators'

const createWindow = () => {
  const listeners = []

  return {
    listeners,
    addEventListener: x => listeners.push(x)
  }
}

test(t => {
  const sh = new TestScheduler()
  const ReactDOM = {}
  const window = createWindow()
  const stream = sh.createHotObservable()
  e.size(ReactDOM, window, stream)
})

test('getWindowChangeEvents:initial', t => {
  const out = []
  const window = createWindow()
  e.getWindowChangeEvents(window).subscribe(x => out.push(x))
  t.is(out.length, 1)
  t.is(out[0], window)
})
