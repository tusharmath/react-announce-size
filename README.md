# react-announce-size
[![Build Status](https://travis-ci.org/tusharmath/react-announce-size.svg?branch=master)](https://travis-ci.org/tusharmath/react-announce-size)
[![npm](https://img.shields.io/npm/v/react-announce-size.svg)](react-announce-size)

a [react-announce](https://github.com/tusharmath/react-announce) declarative that exposes component size as a stream.


## Installation
```
npm i react-announce-size --save
```

## Usage
Say I need to set the width of something that has `position: fixed` equal to that of its parent container. I can do this using this module + the ever-useful [@connect](https://travis-ci.org/tusharmath/react-announce-connect) declarative.


```javascript
import {createSizeStream} from 'react-announce-size'
import {hydrate} from 'react-announce-hydrate'
import {connect} from 'react-announce-connect'
import {Component} from 'react'

/*
The decorator will automatically dispatch the size of `Container` component whenever the screen size changes or the component itself is re-rendered.
*/
const toolbar = createSizeStream()
@hydrate([toolbar.sync()])
class Container extends Component {
  render () {
    return (
      <div style={{width: '100%'}}>
        <span>Hello World!</span>
        <StickyTop/>
      </div>
    )
  }
}

@connect({
  size: toolbar.getStream()
})
class StickyTop extends Component {
  render () {
    const {left, right} = this.state
    return (
      <div style={{position: 'fixed', top: 0, left, right}}>
        <span>STICKY PEOPLE</span>
      </div>
    )
  }
}

```
