/**
 * Created by tushar.mathur on 12/02/16.
 */

'use strict'

import {TestScheduler, ReactiveTest} from 'rx'
import test from 'ava'
const {onNext, onCompleted} = ReactiveTest
import createResizeStream from './../src/createResizeStream'

test(t => {
  const RECT = [
    {top: 1, bottom: 1},
    {top: 1, bottom: 1},
    {top: 1, bottom: 1},
    {top: 1, bottom: 1},
    {top: 1, bottom: 2},
    {top: 1, bottom: 1},
    {top: 1, bottom: 1}
  ]
  const DOM = {
    getBoundingClientRect: () => RECT.pop()
  }
  const out = []
  const ReactDOM = {findDOMNode: () => DOM}
  const sh = new TestScheduler()
  const stream = sh.createHotObservable(
    onNext(210, {event: 'DID_MOUNT'}),
    onNext(250, {event: 'DID_UPDATE'}),
    onCompleted(300)
  )
  const resize = sh.createHotObservable(
    onNext(220, {}),
    onNext(225, {})
  )
  createResizeStream(ReactDOM, stream, resize)
    .subscribe(x => out.push(x))
  sh.start()

  t.same(out, [
    {top: 1, bottom: 1},
    {top: 1, bottom: 2}
  ])
})
