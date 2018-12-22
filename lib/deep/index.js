'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.merge = exports.copy = exports.equal = undefined;

var _equal = require('./equal');

Object.defineProperty(exports, 'equal', {
  enumerable: true,
  get: function get() {
    return _equal.equal;
  }
});

var _copy = require('./copy');

Object.defineProperty(exports, 'copy', {
  enumerable: true,
  get: function get() {
    return _copy.copy;
  }
});

var _merge = require('./merge');

var overwriteMerge = function overwriteMerge(destinationArray, sourceArray, options) {
  return sourceArray;
};

var merge = exports.merge = function merge(destination, source) {
  return (0, _merge.deepmerge)(destination, source, {
    arrayMerge: overwriteMerge
  });
};