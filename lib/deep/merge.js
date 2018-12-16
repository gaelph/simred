"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.deepmerge = deepmerge;

var _ismergeable = _interopRequireDefault(require("./ismergeable"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function emptyTarget(val) {
  return Array.isArray(val) ? [] : {};
}

function cloneUnlessOtherwiseSpecified(value, options) {
  return options.clone !== false && options.isMergeableObject(value) ? deepmerge(emptyTarget(value), value, options) : value;
} // function defaultArrayMerge(target, source, options) {
//   return target.concat(source).map(function (element) {
//     return cloneUnlessOtherwiseSpecified(element, options)
//   })
// }


function mergeObject(target, source, options) {
  var destination = {};
  /* istanbul ignore else */

  if (options.isMergeableObject(target)) {
    Object.keys(target).forEach(function (key) {
      destination[key] = cloneUnlessOtherwiseSpecified(target[key], options);
    });
  }

  Object.keys(source).forEach(function (key) {
    if (!options.isMergeableObject(source[key]) || !target[key]) {
      destination[key] = cloneUnlessOtherwiseSpecified(source[key], options);
    } else {
      destination[key] = deepmerge(target[key], source[key], options);
    }
  });
  return destination;
}

function deepmerge(target, source, options) {
  if ("string" == typeof source) return source;
  if ("object" != _typeof(target) && "object" != _typeof(source)) return source; // if ("string" == typeof target && "string" == typeof source) return source
  // if ("number" == typeof target && "number" == typeof source) return source

  options = options; //|| {}

  options.arrayMerge = options.arrayMerge; // || defaultArrayMerge

  options.isMergeableObject =
  /* options.isMergeableObject ||*/
  _ismergeable.default;
  var sourceIsArray = Array.isArray(source);
  var targetIsArray = Array.isArray(target);
  var sourceAndTargetTypesMatch = sourceIsArray === targetIsArray;

  if (!sourceAndTargetTypesMatch) {
    return cloneUnlessOtherwiseSpecified(source, options);
  } else if (sourceIsArray) {
    return options.arrayMerge(target, source, options);
  } else {
    return mergeObject(target, source, options);
  }
} // deepmerge.all = function deepmergeAll(array, options) {
//   if (!Array.isArray(array)) {
//     throw new Error('first argument should be an array')
//   }
//   return array.reduce(function (prev, next) {
//     return deepmerge(prev, next, options)
//   }, {})
// }