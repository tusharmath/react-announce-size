import test from 'ava'
import e from '../src/decorators'
const noop = x => void 0
test('declarative', t => {
  e.bindToStream = noop
  e({}, {}).size({}, noop)
})
