import test from 'ava'
import e from '../index'
const noop = x => void 0
test('declarative', t => {
  e.bindToStream = noop
  e.declarative({}, noop)
})
