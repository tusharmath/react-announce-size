/**
 * Created by tushar.mathur on 12/02/16.
 */

'use strict'
const RECT_PROPS = require('./RECT_PROPS')

module.exports = (ReactDOM, stream, resize) => stream
    .filter(x => ['DID_MOUNT', 'DID_UPDATE'].indexOf(x.event) > -1)
    .combineLatest(resize, a => a)
    .map(x => ReactDOM.findDOMNode(x))
    .map(x => x.getBoundingClientRect())
    .distinctUntilChanged(x => RECT_PROPS.map(i => x[i]).join(''))
