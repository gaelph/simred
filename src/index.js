/**
 * @module Simred
 * A global store manage
 */

import * as deep from './deep'

let _state = {}
let _reducers = {}

let _listeners = []
let _middlewares = []


/**
 * Calls every registered listener to notify a state update
 * @param {State} state A copy of updated state
 * @private
 */
const onStateUpdate = (state) => {
  _listeners.forEach(listener => {
    listener(state)
  })
}

/**
 * Updates the state by deeply merging the partial update into the original state
 * @param {State} stateCopy     A Copy of the state
 * @param {State} partialState  The updated data
 * @param {string} name          The sub part of the state to update
 * @private
 */
const updateState = (stateCopy, partialState, name) => {
  let newState = {}
  if (partialState) {
    if (name) {
      newState = deep.copy(_state)
      newState[name] = deep.merge(newState[name], partialState)
    }
    else {
      newState = deep.merge(stateCopy, partialState)
    }
  }

  if (!deep.equal(_state, newState)) {
    _state = newState
    onStateUpdate(_state)
  }
}

/**
 * Calls every registered middleware to notify an action took place
 * This is called *after* the state was updated and listeners notified
 * @param {string} actionName 
 * @param {object|array} payload 
 * @private
 */
const applyMiddlewares = (store) => (actionName, payload) => {
  _middlewares.reverse().reduce((next, middleware) => {
    return () => {
      middleware(store)(next)(actionName, payload)
    }
  }, () => { })()
}
let _applyMiddlewares = () => { }

/**
 * Bind an action to its state slice
 * Actions can return promises
 * @param {(state, actions, args...) => state} fn  The action to bind
 * @param {string} parentName  The name of the reducer this actions belongs to
 * @param {string} actionName  The action name
 * @returns {Function} (args...) => void
 * @private
 */
const wrapFunction = (fn, parentName, actionName) => {
  return (...args) => {
    const stateCopy = deep.copy(parentName ? _state[parentName] : _state)
    const partialState = fn(stateCopy, _reducers)(...args)

    if (partialState instanceof Promise) {
      partialState.then(result => {
        updateState(stateCopy, result, parentName)
        _applyMiddlewares(`${parentName}.${actionName}`, args)
      })
    } else {
      updateState(stateCopy, partialState, parentName)
      _applyMiddlewares(`${parentName}.${actionName}`, args)
    }

  }
}

/**
 * Binds all actions in a reducer to the state
 * @param {object} actions    All functions to bind
 * @param {string} parentName Reducer name
 * @returns {object}
 * @private
 */
const wrapActions = (actions, parentName) => {
  return Object.keys(actions).reduce((acc, name) => {
    if (typeof actions[name] === 'function') {
      acc[name] = wrapFunction(actions[name], parentName, name)
    }
    else {
      throw new Error(`Invalid reducer: ${name} is not a function`)
    }

    return acc
  }, {})
}

/**
 * Creates a reducer
 * All actions in the reducer will be called with a state slice of the shape of `initialState`,
 * and will never see the global state.
 * If `initialState == undefined`, actions will be called with the whole global state.
 * This allows actions to handle many-to-many relations between state slices.
 * @param {object} actions 
 * @param {object} [initialState]
 */
export const createReducer = (actions, initialState) => {
  const reducer = {
    actions
  }

  if (initialState != undefined) {
    reducer.state = initialState
  }

  return reducer
}

/**
 * @public
 * @static
 * @memberof Simred
 * Returns a copy of the global state
 * @returns {State}
 */
export function getState() {
  return deep.copy(_state)
}

/**
 * @public
 * @static
 * @memberof Simred
 * Returns all reducers
 * @returns {object}
 */
export function getActions() {
  return _reducers
}


export default {
  /**
   * Creates store
   * @param {object} reducers  The combined reducers
   * @param {object} [state]   An optional initial state to initialize the store with
   * @return {Store}
   */
  createStore: (reducers, state, middlewares = []) => {
    if (!reducers) throw new Error('reducers cannot be undefined')

    // init globals
    _state = {}
    _reducers = {}

    // If createStore is called with a state, use this
    if (state) {
      _state = state
    }

    // build _state and _reducers
    try {
      Object.keys(reducers).forEach(key => {
        const { actions, state } = reducers[key]
        let stateName = undefined

        if (state) { // reducer is linked to a state slice
          if (_state[key]) { // global state received an initial value
            _state[key] = deep.merge(state, _state[key])
          }
          else { // use reducer's initialState
            _state[key] = deep.copy(state)
          }
          stateName = key // the state slice name
        }

        const wrappedAction = wrapActions(actions, stateName)

        // Add the action to the rootReducer as a readonly property
        Object.defineProperty(_reducers, key, {
          configurable: false,
          enumerable: true,
          writable: false,
          value: wrappedAction
        })
      })
    } catch (e) {
      throw e
    }

    const store = {
      // Returns a copy of the current state
      getState: () => deep.copy(_state),
      // Suscribes to every state change
      subscribe: (listener) => {
        _listeners.push(listener)
      },
      // Add a middleware that will called after every action was called
      addMiddleware: (middleware) => {
        _middlewares.push(middleware)
      }
    }

    _applyMiddlewares = applyMiddlewares(store)
    middlewares.forEach(middleware => _middlewares.push(middleware))
    _applyMiddlewares('@@init', [_state])

    Object.defineProperty(store, 'actions', {
      configurable: false,
      enumerable: false,
      set: () => { throw new Error('Stores actions are readonly') },
      get: () => _reducers
    })

    return store
  },

  getState,
  getActions,
}