import * as deep from './deep'

let _state = {}
let _reducers = {}

let _listeners = []
let _middlewares = []

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
const onStateUpdate = (state) => {
  _listeners.forEach(listener => {
    listener(state)
  })
}

/**
 * @private
 * Updates the state by deeply merging the partial update into the original state
 * @param {State} stateCopy     A Copy of the state
 * @param {State} partialState  The updated data
 * @param {string} name          The sub part of the state to update
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
 * @private
 * Calls every registered middleware to notify an action took place
 * This is called *after* the state was updated and listeners notified
 * @param {string} actionName 
 * @param {object|array} payload 
 */
const applyMiddlewares = (actionName, payload) => {
  _middlewares.reverse().reduce((next, middleware) => {
    return () => {
      middleware(actionName, payload, next)
    }
  }, () => { })()
}

/**
 * @private
 * Bind an action to its state slice
 * Actions can return promises
 * @param {ActionFunction} fn  The action to bind: (state, actions, args...) => state
 * @param {string} parentName  The name of the reducer this actions belongs to
 * @param {string} actionName  The action name
 * @returns {Function} (args...) => void
 */
const wrapFunction = (fn, parentName, actionName) => {
  return (...args) => {
    const stateCopy = deep.copy(parentName ? _state[parentName] : _state)
    const partialState = fn(stateCopy, _reducers, ...args)

    if (partialState instanceof Promise) {
      partialState.then(result => {
        updateState(stateCopy, result, parentName)
        applyMiddlewares(`${parentName}.${actionName}`, args)
      })
    } else {
      updateState(stateCopy, partialState, parentName)
      applyMiddlewares(`${parentName}.${actionName}`, args)
    }

  }
}

/**
 * @private
 * Binds all actions in a reducer to the state
 * @param {object} actions    All functions to bind
 * @param {string} parentName Reducer name
 * @returns {object}
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

/**
 * @module Simred
 * A global store manager
 */
export default {
  /**
   * @public
   * @static
   * @memberof Simred
   * Creates store
   * @return {Store}
   */
  createStore: (reducers, state) => {
    if (!reducers) throw new Error('reducers cannot be undefined')

    _state = {}
    _reducers = {}

    if (state) {
      _state = state
    }

    try {
      Object.keys(reducers).forEach(key => {
        const { actions, state } = reducers[key]
        let stateName = undefined

        if (state) {
          if (_state[key]) {
            _state[key] = deep.merge(state, _state[key])
          }
          else {
            _state[key] = deep.copy(state)
          }
          stateName = key
        }

        _reducers[key] = wrapActions(actions, stateName)
      })
    } catch (e) {
      throw e
    }

    const store = {
      getState: () => deep.copy(_state),

      getActions: () => _reducers,
      subscribe: (listener) => {
        _listeners.push(listener)
      },
      addMiddleware: (middleware) => {
        _middlewares.push(middleware)
      }
    }

    return store
  },

  getState,
  getActions,
}