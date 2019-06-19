"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "equal", {
  enumerable: true,
  get: function get() {
    return _equal.equal;
  }
});
Object.defineProperty(exports, "copy", {
  enumerable: true,
  get: function get() {
    return _copy.copy;
  }
});
exports.merge = void 0;

var _merge = require("./merge");

var _equal = require("./equal");

var _copy = require("./copy");

var overwriteMerge = function overwriteMerge(destinationArray, sourceArray, options) {
  return sourceArray;
};

var merge = function merge(destination, source) {
  return (0, _merge.deepmerge)(destination, source, {
    arrayMerge: overwriteMerge
  });
};

exports.merge = merge;