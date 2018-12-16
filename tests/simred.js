const mocha = require('mocha')
const { expect } = require('chai')

const { default: Simred, createReducer } = require('../lib/index')

const fixtures = {
  actions: {
    add: (state, actions, object) => {
      return [...state, object]
    },
    reset: (state, actions) => {
      return []
    }
  },

  initialState: []
}

describe('Simred test Suite', function () {
  afterEach(function () {
    if (Simred.getActions().list) {
      Simred.getActions().list.reset()
    }
  })

  it('reducers are mandatory', function () {
    expect(Simred.createStore).to.throw()
  })

  it('creates a reducer', function () {
    const { actions, initialState } = fixtures

    const reducer = createReducer(actions, initialState)

    expect(reducer).to.be.an('object')
    expect(reducer).to.have.property('actions')
    expect(reducer).to.have.property('state')

    expect(reducer.actions).to.be.an('object')
    expect(reducer.actions).to.have.property('add')
    expect(reducer.actions.add).to.be.a('function')

    expect(reducer.state).to.be.an('array')
    expect(reducer.state).to.be.empty
  })

  it("creates a store", function () {
    const { actions, initialState } = fixtures
    const reducers = {
      list: createReducer(actions, initialState)
    }

    const store = Simred.createStore(reducers)

    expect(store).to.be.an('object')
    expect(store).to.have.property('getState')
    expect(store).to.have.property('getActions')
    expect(store).to.have.property('subscribe')
    expect(store).to.have.property('addMiddleware')

    expect(store.getState).to.be.a('function')
    expect(store.getActions).to.be.a('function')
    expect(store.subscribe).to.be.a('function')
    expect(store.addMiddleware).to.be.a('function')
  })

  it('getState() returns a copy of the state', function () {
    const { actions, initialState } = fixtures
    const reducers = {
      list: createReducer(actions, initialState)
    }

    const store = Simred.createStore(reducers)

    const state = store.getState()
    const otherState = store.getState()

    expect(state).to.deep.equal(otherState)
    expect(state === otherState).to.be.false
  })

  it('getActions() returns all actions', function () {
    const { actions, initialState } = fixtures
    const reducers = {
      list: createReducer(actions, initialState)
    }

    const store = Simred.createStore(reducers)
    const storeActions = store.getActions()

    expect(storeActions).to.have.property('list')
    expect(storeActions.list).to.have.property('add')
    expect(storeActions.list.add).to.be.a('function')
  })

  it('module and object getState() and getActions() have same result', function () {
    const { actions, initialState } = fixtures
    const reducers = {
      list: createReducer(actions, initialState)
    }

    const store = Simred.createStore(reducers)

    const moduleState = Simred.getState()
    const moduleActions = Simred.getActions()

    const objectState = store.getState()
    const objectActions = store.getActions()
    
    expect(moduleState).to.deep.equal(objectState)
    expect(moduleActions).to.deep.equal(objectActions)
  })

  it('calls subscribers when the state mutates', function () {
    const { actions, initialState } = fixtures
    const reducers = {
      list: createReducer(actions, initialState)
    }

    const store = Simred.createStore(reducers)
    const initState = store.getState()

    let moddedState = initialState
    store.subscribe((state) => {
      moddedState = state
    })

    store.getActions().list.add('test')

    expect(moddedState).to.not.deep.equal(initState)
    expect(moddedState).to.deep.equal({ list: ['test'] })
  })

  it('calls middlewares when an action is called', function () {
    const { actions, initialState } = fixtures
    const reducers = {
      list: createReducer(actions, initialState)
    }

    const store = Simred.createStore(reducers)
    
    let middlewarecalls = []
    store.addMiddleware((actionName, actionPayload, next) => {
      middlewarecalls.push({
        actionName, actionPayload
      })

      next()
    })

    store.getActions().list.add('test')

    expect(middlewarecalls).to.have.lengthOf(1)
    expect(middlewarecalls[0].actionName).to.equal('list.add')
    expect(middlewarecalls[0].actionPayload).to.deep.equal(['test'])
  })

  it('loads a stored state', function () {
    const state = { list: ['test'] }
    const { actions, initialState } = fixtures
    const reducers = {
      list: createReducer(actions, initialState)
    }

    const store = Simred.createStore(reducers, state)

    expect(state).to.deep.equal(store.getState())

  })

  it('cannot have nested actions', function () {
    const actions = {
      todos: {
        list: {
          add: (state, actions, todo) => {
            console.log(state)
            return [...state, todo]
          }
        }
      }
    }

    const initialState = {
      list: []
    }

    const reducer = createReducer(actions, initialState)

    const badStore = () => {
      Simred.createStore({ todos: reducer })
    }

    expect(badStore).to.throw()
  })

  it('reducers without an initial state have actions receiving the whole state', function () {
    let receivedState = {}

    const sharedActions = {
      doSomething: (state, actions, arg) => {
        receivedState = state

        return { ...state }
      }
    }

    const todoActions = {
      add: (state, actions, arg) => [...state, arg]
    }

    const todoInitialState = []

    const listActions = {
      append: (state, actions, arg) => [...state, arg],
      reset: (state, actions) => []
    }

    const listInitialState = []

    const reducers = {
      todos: createReducer(todoActions, todoInitialState),
      list: createReducer(listActions, listInitialState),
      shared: createReducer(sharedActions)
    }

    const store = Simred.createStore(reducers)

    const resultState = store.getState()
    const resultActions = store.getActions()

    expect(resultState).to.have.property('todos')
    expect(resultActions).to.have.property('todos')

    expect(resultState).to.have.property('list')
    expect(resultActions).to.have.property('list')

    expect(resultState).to.not.have.property('shared')
    expect(resultActions).to.have.property('shared')

    resultActions.shared.doSomething()
    const updatedState = store.getState()

    expect(receivedState).to.deep.equal(updatedState)

  })

  it('actions can return undefined', function () {
    const actions = {
      add: (state, actions, todo) => {
        return 
      },
      reset: () => []
    }

    const initialState = {
      list: []
    }

    const store = Simred.createStore({
      list: createReducer(actions, initialState)
    })

    expect(store.getActions().list.add).to.not.throw()
  })

})

describe('Asynchronous Actions', function () {

  it('actions can be asynchronous', function () {
    const listActions = {
      append: async (state, actions, arg) => [...state, arg],
      reset: (state, actions) => []
    }

    const listInitialState = []

    const store = Simred.createStore({
      list : createReducer(listActions, listInitialState)
    })

    return new Promise(resolve => {
      store.subscribe((state) => {
        expect(state).to.have.property('list')
        expect(state.list).to.be.an('array')
        expect(state.list).to.include('a')

        resolve()
      })

      const actions = store.getActions()
  
      actions.list.append('a')
    })

  })
})