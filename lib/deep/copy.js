"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/**
 * @private
 * Deeply copies an object
 * @param {object} obj Object to Copy
 * @return {object}
*/
var copy = exports.copy = function copy(obj) {
  if (null == obj || "object" != (typeof obj === "undefined" ? "undefined" : _typeof(obj))) return obj;
  if (obj instanceof Date) {
    var copy_ = new Date();
    copy_.setTime(obj.getTime());
    return copy_;
  }
  if (obj instanceof Array) {
    var _copy_ = [];
    for (var i = 0, len = obj.length; i < len; i++) {
      _copy_[i] = copy(obj[i]);
    }
    return _copy_;
  }
  /* istanbul ignore else */
  if (obj instanceof Object) {
    var _copy_2 = {};
    for (var attr in obj) {
      /* istanbul ignore else */
      if (obj.hasOwnProperty(attr)) _copy_2[attr] = copy(obj[attr]);
    }
    return _copy_2;
  }

  /* istanbul ignore next */
  throw new Error("Unable to copy obj this object.");
};