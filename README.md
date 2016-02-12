# react-announce-size
[![Build Status](https://travis-ci.org/tusharmath/react-announce-size.svg?branch=master)](https://travis-ci.org/tusharmath/react-announce-size)
[![npm](https://img.shields.io/npm/v/react-announce-size.svg)](react-announce-size)

a [react-announce](https://github.com/tusharmath/react-announce) a declarative that dispatches `RESIZE` event on the component's stream.


## Installation
```
npm i react-announce-size --save
```

## Usage



```javascript
import {resize} from 'react-announce-size'
import {asStream} from 'react-announce'
import {Component} from 'react'
import {Subject} from 'rx'

/*
The decorator will automatically dispatch the size of `Container` component whenever the screen size changes or the component itself is re-rendered.
*/

const observer = new Rx.Subject()


@resize
@asStream(observer)
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
/* OUTPUT:
 * {event: 'RESIZE', component: Container{}, args: [{top:0, bottom ...}] } 
 */

```
