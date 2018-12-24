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

var _state = {}; /**
                  * @module Simred
                  * A global store manage
                  */

var _reducers = {};

var _listeners = [];
var _middlewares = [];

/**
 * Calls every registered listener to notify a state update
 * @param {State} state A copy of updated state
 * @private
 */
var onStateUpdate = function onStateUpdate(state) {
  _listeners.forEach(function (listener) {
    listener(state);
  });
};

/**
 * Updates the state by deeply merging the partial update into the original state
 * @param {State} stateCopy     A Copy of the state
 * @param {State} partialState  The updated data
 * @param {string} name          The sub part of the state to update
 * @private
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
 * Calls every registered middleware to notify an action took place
 * This is called *after* the state was updated and listeners notified
 * @param {string} actionName 
 * @param {object|array} payload 
 * @private
 */
var applyMiddlewares = function applyMiddlewares(store) {
  return function (actionName, payload) {
    _middlewares.reverse().reduce(function (next, middleware) {
      return function () {
        middleware(store)(next)(actionName, payload);
      };
    }, function () {})();
  };
};
var _applyMiddelwares = function _applyMiddelwares() {};

/**
 * Bind an action to its state slice
 * Actions can return promises
 * @param {(state, actions, args...) => state} fn  The action to bind
 * @param {string} parentName  The name of the reducer this actions belongs to
 * @param {string} actionName  The action name
 * @returns {Function} (args...) => void
 * @private
 */
var wrapFunction = function wrapFunction(fn, parentName, actionName) {
  return function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var stateCopy = deep.copy(parentName ? _state[parentName] : _state);
    var partialState = fn(stateCopy, _reducers).apply(undefined, args);

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
 * Binds all actions in a reducer to the state
 * @param {object} actions    All functions to bind
 * @param {string} parentName Reducer name
 * @returns {object}
 * @private
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
 * Creates a reducer
 * All actions in the reducer will be called with a state slice of the shape of `initialState`,
 * and will never see the global state.
 * If `initialState == undefined`, actions will be called with the whole global state.
 * This allows actions to handle many-to-many relations between state slices.
 * @param {object} actions 
 * @param {object} [initialState]
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

exports.default = {
  /**
   * Creates store
   * @param {object} reducers  The combined reducers
   * @param {object} [state]   An optional initial state to initialize the store with
   * @return {Store}
   */
  createStore: function createStore(reducers, state) {
    var middlewares = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

    if (!reducers) throw new Error('reducers cannot be undefined');

    // init globals
    _state = {};
    _reducers = {};

    // If createStore is called with a state, use this
    if (state) {
      _state = state;
    }

    // build _state and _reducers
    try {
      Object.keys(reducers).forEach(function (key) {
        var _reducers$key = reducers[key],
            actions = _reducers$key.actions,
            state = _reducers$key.state;

        var stateName = undefined;

        if (state) {
          // reducer is linked to a state slice
          if (_state[key]) {
            // global state received an initial value
            _state[key] = deep.merge(state, _state[key]);
          } else {
            // use reducer's initialState
            _state[key] = deep.copy(state);
          }
          stateName = key; // the state slice name
        }

        var wrappedAction = wrapActions(actions, stateName);

        // Add the action to the rootReducer as a readonly property
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
      // Returns a copy of the current state
      getState: function getState() {
        return deep.copy(_state);
      },
      // Suscribes to every state change
      subscribe: function subscribe(listener) {
        _listeners.push(listener);
      },
      // Add a middleware that will called after every action was called
      addMiddleware: function addMiddleware(middleware) {
        _middlewares.push(middleware);
      }
    };

    _applyMiddelwares = applyMiddlewares(store);
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