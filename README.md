# react-announce-size
[![Build Status][travis-icon]][travis-build]
[![npm][npm-version-icon]][npm]

A [react-announce](https://github.com/tusharmath/react-announce) based decorator that dispatches a custom event — `RESIZE`, on the component's stream whenever there is a real change in size.


## Installation
```
npm i react-announce-size --save
```

## Usage

```javascript
import {size} from 'react-announce-size'
import {asStream} from 'react-announce'
import {Component} from 'react'

/*
The decorator will automatically dispatch the size of `Container` component whenever the screen size changes or the component itself is re-rendered.
*/


@asStream(observer)
@size
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
observer.subscribe(x => console.log(x))

/** OUTPUT

  Object {component: Container, event: "WILL_MOUNT", args: Array[]}
  Object {component: Container, event: "DID_MOUNT", args: Array[]}
  Object {component: Container, event: "RESIZE", args: Array[1]}
  Object {component: Container, event: "RESIZE", args: Array[1]}
  ...

  **/

```

[travis-icon]: https://travis-ci.org/tusharmath/react-announce-size.svg?branch=master
[travis-build]: https://travis-ci.org/tusharmath/react-announce-size
[npm-version-icon]: https://img.shields.io/npm/v/react-announce-size.svg
[npm]: https://www.npmjs.com/package/react-announce-size
