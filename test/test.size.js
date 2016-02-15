/**
 * Created by tushar.mathur on 12/02/16.
 */

'use strict'

import { TestScheduler, ReactiveTest } from 'rx'
import test from 'ava'
const {onNext} = ReactiveTest

import e from '../src/decorators'

test('bindToStream', t => {

  const out = []
  const window = {}
  const sh = new TestScheduler()
  const sizes = [
    {top: 1, left: 0},
    {top: 2, left: 0},
    {top: 3, left: 0},
    {top: 4, left: 0},
    {top: 5, left: 0}
  ]
  const stream = sh.createHotObservable(
    onNext(200, {event: 'DID_MOUNT', component: {props: 1}}),
    onNext(220, {event: 'DID_UPDATE', component: {props: 2}})
  )

  const d = {
    ReactDOM: {findDOMNode: x => ({
          getBoundingClientRect: x => sizes.shift()
    })},
    dispatchSize: x => out.push(x),
    getResizeStream: x => sh.createHotObservable(
        onNext(210, {}),
        onNext(225, {}),
        onNext(230, {})
    )
  }

  e.bindToStream(d, stream, window)
  sh.start()
  t.same(out, [
    { size: { top: 1, left: 0 }, component: { props: 1 } },
    { size: { top: 2, left: 0 }, component: { props: 1 } },
    { size: { top: 3, left: 0 }, component: { props: 2 } },
    { size: { top: 4, left: 0 }, component: { props: 2 } },
    { size: { top: 5, left: 0 }, component: { props: 2 } }
  ])
})

test('bindToStream:initial', t => {
  const sizes = [
    {top: 2, left: 0},
    {top: 3, left: 0}
  ]
  const out = []
  const window = {}
  const sh = new TestScheduler()
  const stream = sh.createHotObservable(
    onNext(201, {event: 'DID_MOUNT', component: {props: 1}}),
    onNext(221, {event: 'DID_UPDATE', component: {props: 2}})
  )

  const d = {
    ReactDOM: {findDOMNode: x => ({getBoundingClientRect: x => sizes.pop() })},
    dispatchSize: x => out.push(x),
    getResizeStream: x => sh.createHotObservable()
  }

  e.bindToStream(d, stream, window)
  sh.start()
  t.same(out, [
    { size: { top: 3, left: 0 }, component: { props: 1 } },
    { size: { top: 2, left: 0 }, component: { props: 2 } } ]
  )
})
