"use strict";

require("core-js/modules/es.symbol");

require("core-js/modules/es.array.concat");

require("core-js/modules/es.array.filter");

require("core-js/modules/es.array.splice");

require("core-js/modules/es.object.get-own-property-descriptor");

require("core-js/modules/es.object.keys");

require("core-js/modules/es.object.to-string");

require("core-js/modules/es.promise");

require("core-js/modules/web.dom-collections.for-each");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getState = getState;
exports.getActions = getActions;
exports.default = exports.composeReducers = exports.withInitialState = exports.createReducer = void 0;

require("core-js/stable");

require("regenerator-runtime/runtime");

var deep = _interopRequireWildcard(require("./deep"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _state = {};
var _reducers = {};
var _listeners = [];
var _middlewares = [];

var onStateUpdate = function onStateUpdate(state) {
  _listeners.forEach(function (listener) {
    listener(state);
  });
};

var updateState = function updateState(stateCopy, partialState, name) {
  var newState = {};

  if (partialState) {
    if (name) {
      newState = deep.copy(_state);
      newState[name] = deep.merge(newState[name], partialState);
    } else {
      newState = deep.merge(stateCopy, partialState);
    }
  }

  if (!deep.equal(_state, newState)) {
    _state = newState;
    onStateUpdate(_state);
  }
};

var applyMiddlewares = function applyMiddlewares(store) {
  return function (actionName, payload) {
    _middlewares.reverse().reduce(function (next, middleware) {
      return function () {
        middleware(store)(next)(actionName, payload);
      };
    }, function () {})();
  };
};

var _applyMiddlewares = function _applyMiddlewares() {};

var wrapFunction = function wrapFunction(fn, parentName, actionName) {
  return function () {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var stateCopy = deep.copy(parentName ? _state[parentName] : _state);
    var partialState = fn(stateCopy, _reducers).apply(void 0, args);

    if (partialState instanceof Promise) {
      partialState.then(function (result) {
        updateState(stateCopy, result, parentName);

        _applyMiddlewares("".concat(parentName, ".").concat(actionName), args);
      });
    } else {
      updateState(stateCopy, partialState, parentName);

      _applyMiddlewares("".concat(parentName, ".").concat(actionName), args);
    }
  };
};

var wrapActions = function wrapActions(actions, parentName) {
  return Object.keys(actions).reduce(function (acc, name) {
    if (typeof actions[name] === 'function') {
      acc[name] = wrapFunction(actions[name], parentName, name);

      if (!_reducers[name]) {
        Object.defineProperty(_reducers, name, {
          configurable: false,
          enumerable: true,
          writable: false,
          value: acc[name]
        });
      } else {
        console.warn("".concat(parentName, ".").concat(name, ": Root reducer already has a function \"").concat(name, "\".\n Only the one assigned first will be available as \"store.actions.").concat(name, "()\".\n This one will be available under \"store.actions.").concat(parentName, ".").concat(name, "()"));
      }
    } else {
      throw new Error("Invalid reducer: ".concat(name, " is not a function"));
    }

    return acc;
  }, {});
};

var createReducer = function createReducer(actions, initialState) {
  var reducer = {
    actions: actions
  };

  if (initialState != undefined) {
    reducer.state = initialState;
  }

  return reducer;
};

exports.createReducer = createReducer;

var withInitialState = function withInitialState(initialState) {
  return function (actions) {
    return createReducer(actions, initialState);
  };
};

exports.withInitialState = withInitialState;

var composeReducers = function composeReducers() {
  for (var _len2 = arguments.length, reducers = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    reducers[_key2] = arguments[_key2];
  }

  return reducers.reduce(function (composed, reducer) {
    composed = {
      actions: _objectSpread({}, composed.actions, reducer.actions),
      state: _objectSpread({}, composed.state, reducer.state)
    };
  }, {
    actions: {},
    state: {}
  });
};

exports.composeReducers = composeReducers;

function getState() {
  return deep.copy(_state);
}

function getActions() {
  return _reducers;
}

var _default = {
  createStore: function createStore(reducers, state) {
    var middlewares = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
    if (!reducers) throw new Error('reducers cannot be undefined');
    _state = {};
    _reducers = {};

    if (state) {
      _state = state;
    }

    try {
      Object.keys(reducers).forEach(function (key) {
        var _reducers$key = reducers[key],
            actions = _reducers$key.actions,
            state = _reducers$key.state;
        var stateName = undefined;

        if (state) {
          if (_state[key]) {
            _state[key] = deep.merge(state, _state[key]);
          } else {
            _state[key] = deep.copy(state);
          }

          stateName = key;
        }

        var wrappedAction = wrapActions(actions, stateName);
        Object.defineProperty(_reducers, key, {
          configurable: false,
          enumerable: true,
          writable: false,
          value: wrappedAction
        });
      });
    } catch (e) {
      throw e;
    }

    var store = {
      getState: function getState() {
        return deep.copy(_state);
      },
      subscribe: function subscribe(listener) {
        function unsubcribe() {
          var i = _listeners.indexOf(listener);

          _listeners.splice(i, 1);
        }

        _listeners.push(listener);

        return unsubcribe;
      },
      addMiddleware: function addMiddleware(middleware) {
        _middlewares.push(middleware);
      }
    };
    _applyMiddlewares = applyMiddlewares(store);
    middlewares.forEach(function (middleware) {
      return _middlewares.push(middleware);
    });

    _applyMiddlewares('@@init', [_state]);

    Object.defineProperty(store, 'actions', {
      configurable: false,
      enumerable: false,
      set: function set() {
        throw new Error('Stores actions are readonly');
      },
      get: function get() {
        return _reducers;
      }
    });
    return store;
  },
  getState: getState,
  getActions: getActions
};
exports.default = _default;