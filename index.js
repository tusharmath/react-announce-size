/**
 * Created by tushar.mathur on 22/12/15.
 */

const ReactDOM = require('react-dom')

const decorators = require('./src/decorators')
exports.size = decorators(window, ReactDOM)
