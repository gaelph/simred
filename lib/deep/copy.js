"use strict";

require("core-js/modules/es.symbol");

require("core-js/modules/es.symbol.description");

require("core-js/modules/es.symbol.iterator");

require("core-js/modules/es.array.iterator");

require("core-js/modules/es.object.to-string");

require("core-js/modules/es.string.iterator");

require("core-js/modules/web.dom-collections.iterator");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.copy = void 0;

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var copy = function copy(obj) {
  if (null == obj || "object" != _typeof(obj)) return obj;

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

  if (obj instanceof Object) {
    var _copy_2 = {};

    for (var attr in obj) {
      if (obj.hasOwnProperty(attr)) _copy_2[attr] = copy(obj[attr]);
    }

    return _copy_2;
  }

  throw new Error("Unable to copy obj this object.");
};

exports.copy = copy;