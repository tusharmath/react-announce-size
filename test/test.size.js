/**
 * Created by tushar.mathur on 12/02/16.
 */

'use strict'

import { TestScheduler, ReactiveTest } from 'rx'
import test from 'ava'
const {onNext} = ReactiveTest

import e from '../index'

test('ReactDOM', t => {
  t.same(e.ReactDOM, require('react-dom'))
})

test('bindToStream', t => {

  const out = []
  const window = {}
  const sh = new TestScheduler()
  const sizes = [
    {top: 1, left: 0},
    {top: 1, left: 0},
    {top: 2, left: 0},
    {top: 2, left: 0}
  ]
  const stream = sh.createHotObservable(
    onNext(201, {event: 'DID_MOUNT', component: {props: 1}}),
    onNext(221, {event: 'DID_UPDATE', component: {props: 2}})
  )

  const d = {
    ReactDOM: {findDOMNode: x => ({
          getBoundingClientRect: x => sizes.pop()
    })},
    dispatchSize: x => out.push(x),
    getResizeStream: x => sh.createHotObservable(
        onNext(210, {}),
        onNext(212, {}),
        onNext(214, {})
    ),
    getComponentSizeStream: x => sh.createHotObservable(
        onNext(210, {a: 1, b: 1})
    )
  }

  e.bindToStream(d, stream, window)
  sh.start()
  t.same(out, [
    { size: { top: 2, left: 0 }, component: { props: 1 } },
    { size: { top: 1, left: 0 }, component: { props: 1 } }
  ])
})
