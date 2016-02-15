import { TestScheduler, ReactiveTest } from 'rx'
import test from 'ava'
const {onNext} = ReactiveTest

import e from '../src/decorators'

const createWindow = () => {
  const listeners = []

  return {
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
