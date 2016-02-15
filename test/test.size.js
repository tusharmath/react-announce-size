import { TestScheduler, ReactiveTest } from 'rx'
import test from 'ava'
const {onNext} = ReactiveTest

import e from '../src/decorators'

const createWindow = () => {
  const listeners = []

  return {
    listeners,
    addEventListener: (ev, cb) => listeners.push({ev, cb})
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
  t.same(out, [[ null, null ]])
})
