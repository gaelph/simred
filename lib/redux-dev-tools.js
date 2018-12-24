'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var devTools = void 0;
if (window.__REDUX_DEVTOOLS_EXTENSION__) {
  devTools = window.__REDUX_DEVTOOLS_EXTENSION__.connect(config);

  devTools.subscribe(function (message) {
    if (message.type === 'DISPATCH' && message.state) {
      console.log('DevTools requested to change the state to', message.state);
    }
  });
} else {
  devTools = {
    init: function init() {},
    send: function send() {},
    subscribe: function subscribe() {}
  };
}

var devToolsMiddleware = exports.devToolsMiddleware = function devToolsMiddleware(store) {
  return function (next) {
    return function (action, payload) {
      if (actions == '@@init') {
        var _payload = _slicedToArray(payload, 1),
            state = _payload[0];

        devtools.init(state);
      } else {
        devTools.send({ type: action, payload: payload }, store.getState());
      }

      next();
    };
  };
};