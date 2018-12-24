const { default: Simred, createReducer } = require('../src/index')

const fixtures = {
  actions: {
    add: (state) => (object) => {
      return [...state, object]
    },
    reset: () => () => {
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
    expect(Simred.createStore).toThrow()
  })

  it('creates a reducer', function () {
    const { actions, initialState } = fixtures

    const reducer = createReducer(actions, initialState)

    expect(typeof reducer).toBe('object')
    expect(reducer).toHaveProperty('actions')
    expect(reducer).toHaveProperty('state')

    expect(typeof reducer.actions).toBe('object')
    expect(reducer.actions).toHaveProperty('add')
    expect(typeof reducer.actions.add).toBe('function')

    expect(Array.isArray(reducer.state)).toBeTruthy()
    expect(reducer.state.length).toBe(0)
  })

  it("creates a store", function () {
    const { actions, initialState } = fixtures
    const reducers = {
      list: createReducer(actions, initialState)
    }

    const store = Simred.createStore(reducers)

    expect(typeof store).toBe('object')
    expect(store).toHaveProperty('getState')
    expect(store).toHaveProperty('actions')
    expect(store).toHaveProperty('subscribe')
    expect(store).toHaveProperty('addMiddleware')

    expect(typeof store.getState).toBe('function')
    expect(typeof store.actions).toBe('object')
    expect(typeof store.subscribe).toBe('function')
    expect(typeof store.addMiddleware).toBe('function')
  })

  it('getState() returns a copy of the state', function () {
    const { actions, initialState } = fixtures
    const reducers = {
      list: createReducer(actions, initialState)
    }

    const store = Simred.createStore(reducers)

    const state = store.getState()
    const otherState = store.getState()

    expect(state).toMatchObject(otherState)
    expect(state).toStrictEqual(otherState)
  })

  it('store.actions returns all actions', function () {
    const { actions, initialState } = fixtures
    const reducers = {
      list: createReducer(actions, initialState)
    }

    const store = Simred.createStore(reducers)
    const storeActions = store.actions

    expect(storeActions).toHaveProperty('list')
    expect(storeActions.list).toHaveProperty('add')
    expect(typeof storeActions.list.add).toBe('function')
  })

  it('throws when trying to write on actions', function () {
    const { actions, initialState } = fixtures
    const reducers = {
      list: createReducer(actions, initialState)
    }

    const store = Simred.createStore(reducers)
    
    const badFunction = () => store.actions = undefined

    expect(badFunction).toThrow()
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
    const objectActions = store.actions
    
    expect(moduleState).toMatchObject(objectState)
    expect(moduleActions).toMatchObject(objectActions)
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

    store.actions.list.add('test')

    expect(moddedState).not.toMatchObject(initState)
    expect(moddedState).toMatchObject({ list: ['test'] })
  })

  it('adds middleware on createStore', function () {
    const { actions, initialState } = fixtures
    const reducers = {
      list: createReducer(actions, initialState)
    }

    let middlewarecalls = []
    const middlewares = [
      (store) => (next) => (actionName, actionPayload) => {
        middlewarecalls.push({
          actionName,
          actionPayload
        })

        next()
      }
    ]

    Simred.createStore(reducers, {}, middlewares)
  })

  it('calls middlewares when an action is called', function () {
    const { actions, initialState } = fixtures
    const reducers = {
      list: createReducer(actions, initialState)
    }

    const store = Simred.createStore(reducers)
    
    let middlewarecalls = []
    store.addMiddleware((store) => (next) => (actionName, actionPayload) => {
      middlewarecalls.push({
        actionName, actionPayload
      })

      next()
    })

    store.actions.list.add('test')

    expect(middlewarecalls.length).toBe(1)
    expect(middlewarecalls[0].actionName).toBe('list.add')
    expect(middlewarecalls[0].actionPayload).toEqual(expect.arrayContaining(['test']))
  })

  it('loads a stored state', function () {
    const state = { list: ['test'] }
    const { actions, initialState } = fixtures
    const reducers = {
      list: createReducer(actions, initialState)
    }

    const store = Simred.createStore(reducers, state)

    expect(state).toMatchObject(store.getState())

  })

  it('cannot have nested actions', function () {
    const actions = {
      todos: {
        list: {
          add: (state) => (todo) => {
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

    expect(badStore).toThrow()
  })

  it('reducers without an initial state have actions receiving the whole state', function () {
    let receivedState = {}

    const sharedActions = {
      doSomething: (state) => () => {
        receivedState = state

        return { ...state }
      }
    }

    const todoActions = {
      add: (state) => (arg) => [...state, arg]
    }

    const todoInitialState = []

    const listActions = {
      append: (state) => (arg) => [...state, arg],
      reset: () => () => []
    }

    const listInitialState = []

    const reducers = {
      todos: createReducer(todoActions, todoInitialState),
      list: createReducer(listActions, listInitialState),
      shared: createReducer(sharedActions)
    }

    const store = Simred.createStore(reducers)

    const resultState = store.getState()
    const resultActions = store.actions

    expect(resultState).toHaveProperty('todos')
    expect(resultActions).toHaveProperty('todos')

    expect(resultState).toHaveProperty('list')
    expect(resultActions).toHaveProperty('list')

    expect(resultState).not.toHaveProperty('shared')
    expect(resultActions).toHaveProperty('shared')

    resultActions.shared.doSomething()
    const updatedState = store.getState()

    expect(receivedState).toMatchObject(updatedState)

  })

  it('actions can return undefined', function () {
    const actions = {
      add: () => () => {
        return 
      },
      reset: () => () => []
    }

    const initialState = {
      list: []
    }

    const store = Simred.createStore({
      list: createReducer(actions, initialState)
    })

    expect(store.actions.list.add).not.toThrow()
  })

})

describe('Asynchronous Actions', function () {

  it('actions can be asynchronous', function () {
    const listActions = {
      append: (state) => async (arg) => [...state, arg],
      reset: () => () => []
    }

    const listInitialState = []

    const store = Simred.createStore({
      list : createReducer(listActions, listInitialState)
    })

    return new Promise(resolve => {
      store.subscribe((state) => {
        expect(state).toHaveProperty('list')
        expect(state.list).toEqual(expect.arrayContaining(['a']))

        resolve()
      })


      const actions = store.actions
  
      actions.list.append('a')
    })

  })
})