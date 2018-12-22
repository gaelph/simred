'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createReducer = undefined;
exports.getState = getState;
exports.getActions = getActions;

var _deep = require('./deep');

var deep = _interopRequireWildcard(_deep);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var _state = {};
var _reducers = {};

var _listeners = [];
var _middlewares = [];

/**
 * @callback MiddlewareFunction
 * @param {string} name Action name
 * @param {*} payload Action payload
 * @param {() => undefined} next Next middleware
 */

/**
 * @callback ListenerFunction
 * @param {State} state 
 */

/**
 * @public
 * @typedef {Object} Store
 * @property {() => State} getState
 * @property {() => object} getActions
 * @property {(listener: ListenerFunction) => undefined} subscribe
 * @property {(middleware: MiddlewareFunction) => undefined} addMiddleware
 */

/**
 * @private
 * Calls every registered listener to notify a state update
 * @param {State} state A copy of updated state
 */
var onStateUpdate = function onStateUpdate(state) {
  _listeners.forEach(function (listener) {
    listener(state);
  });
};

/**
 * @private
 * Updates the state by deeply merging the partial update into the original state
 * @param {State} stateCopy     A Copy of the state
 * @param {State} partialState  The updated data
 * @param {string} name          The sub part of the state to update
 */
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

/**
 * @private
 * Calls every registered middleware to notify an action took place
 * This is called *after* the state was updated and listeners notified
 * @param {string} actionName 
 * @param {object|array} payload 
 */
var applyMiddlewares = function applyMiddlewares(actionName, payload) {
  _middlewares.reverse().reduce(function (next, middleware) {
    return function () {
      middleware(actionName, payload, next);
    };
  }, function () {})();
};

/**
 * @private
 * Bind an action to its state slice
 * Actions can return promises
 * @param {ActionFunction} fn  The action to bind: (state, actions, args...) => state
 * @param {string} parentName  The name of the reducer this actions belongs to
 * @param {string} actionName  The action name
 * @returns {Function} (args...) => void
 */
var wrapFunction = function wrapFunction(fn, parentName, actionName) {
  return function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var stateCopy = deep.copy(parentName ? _state[parentName] : _state);
    var partialState = fn.apply(undefined, [stateCopy, _reducers].concat(args));

    if (partialState instanceof Promise) {
      partialState.then(function (result) {
        updateState(stateCopy, result, parentName);
        applyMiddlewares(parentName + '.' + actionName, args);
      });
    } else {
      updateState(stateCopy, partialState, parentName);
      applyMiddlewares(parentName + '.' + actionName, args);
    }
  };
};

/**
 * @private
 * Binds all actions in a reducer to the state
 * @param {object} actions    All functions to bind
 * @param {string} parentName Reducer name
 * @returns {object}
 */
var wrapActions = function wrapActions(actions, parentName) {
  return Object.keys(actions).reduce(function (acc, name) {
    if (typeof actions[name] === 'function') {
      acc[name] = wrapFunction(actions[name], parentName, name);
    } else {
      throw new Error('Invalid reducer: ' + name + ' is not a function');
    }

    return acc;
  }, {});
};

/**
 * @public
 * @static
 * Creates a reducer
 * All actions in the reducer will be called with a state slice of the shape of `initialState`,
 * and will never see the global state.
 * If `initialState == undefined`, actions will be called with the whole global state.
 * This allows actions to handle many-to-many relations between state slices.
 * @param {object} actions 
 * @param {[object]} initialState 
 */
var createReducer = exports.createReducer = function createReducer(actions, initialState) {
  var reducer = {
    actions: actions
  };

  if (initialState != undefined) {
    reducer.state = initialState;
  }

  return reducer;
};

/**
 * @public
 * @static
 * @memberof Simred
 * Returns a copy of the global state
 * @returns {State}
 */
function getState() {
  return deep.copy(_state);
}

/**
 * @public
 * @static
 * @memberof Simred
 * Returns all reducers
 * @returns {object}
 */
function getActions() {
  return _reducers;
}

/**
 * @module Simred
 * A global store manager
 */
exports.default = {
  /**
   * @public
   * @static
   * @memberof Simred
   * Creates store
   * @return {Store}
   */
  createStore: function createStore(reducers, state) {
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

        _reducers[key] = wrapActions(actions, stateName);
      });
    } catch (e) {
      throw e;
    }

    var store = {
      getState: function getState() {
        return deep.copy(_state);
      },

      getActions: function getActions() {
        return _reducers;
      },
      subscribe: function subscribe(listener) {
        _listeners.push(listener);
      },
      addMiddleware: function addMiddleware(middleware) {
        _middlewares.push(middleware);
      }
    };

    return store;
  },

  getState: getState,
  getActions: getActions
};