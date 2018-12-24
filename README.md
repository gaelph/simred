# simred [![NPM version](https://badge.fury.io/js/simred.svg)](https://npmjs.org/package/simred) [![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]() ![Tests](https://img.shields.io/badge/tests-22%2F22-brightgreen.svg) ![Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen.svg)

A simple redux-like application state manager

- Does not use actions objects, but function calls
- Supports async actions out of the box
- Does not require `redux-thunk`, similar functionality is provided
- Does not require `redux-actions`
- Does not require `reduce-reducers` to handle relations between parts of state
- Third parties can listen to state changes through `subscribe()`
- Supports middlewares through `addMiddleware()`
- Has type definitions for Typescript™

## Table of Content
- [Installation](#installation)
- [Getting Started](#getting-started)
- [Core Concepts](#core-concepts)
- [Basics](#basics)
  - [Actions](#action)
  - [Reducers](#reducers)
  - [Store](#store)
- [Complete Example: To-do List](#complete-example-to-do-list)
- [Usage with React](#usage-with-react)
- [License](#license)

## Installation

```sh
$ npm install --save simred
```

## Getting Started

The first example is a simple counter.  
Same as other state management libraries such as Redux, the state in contained in a single readonly object.  
This only way to change it is to call "actions".
To determine how actions change the state, you write pure reducers.
```js
import Simred, { createReducer } from 'simred'

/**
 * This is a reducer,
 * an object with only functions with signatures of:
 * (state, actions, ...args) => state
 * It discribes operation to transform the state
 * 
 * The shape of the state is up to you.
 */
const counter = createReducer(
  // actions
  {
    increment: (state) => () => state + 1,
    decrement: (state) => () => state - 1
  },
  /* initial value for the state */
  0
)

// Creates a Simred store to hold your data
const store = Simred.createStore({ counter })

// You can subscribe to any changes to the state to make your
// app reactive to changes, or store the state to localStorage
store.subscribe(state => console.log(state))

// The only way to change the state is to call an action
// you can access actions through the getActions() getter
const actions = store.actions

actions.counter.increment() // state == { counter: 1 }
actions.counter.increment() // state == { counter: 2 }
actions.counter.decrement() // state == { counter: 1 }
```
---
## Core concepts
Simred works in a similar way as Redux, and respects the same three principles:

**Single source of truth**
The global state is stored in a single object, in a single store.

**State is read-only**
The only way to change the state is though _actions_.

**Changes are made with pure functions**
Actions in the reducers should not mutate the state, but return a new object.

---
## Basics

### Actions
Actions are the only way to change the state.
They are functions of a reducer (see next section) with the following signature:
```typescript
// synchronous actions
(state: State, actions: Actions) => (...args: any[]) => Partial<State>

// asynchronous actions
(state: State, actions: Actions) => async (...args: any[]) => Partial<State>
```
The `state` argument is a copy of the part of state the action relates to.
The `actions` argument is a read-only object containing all other actions in the store.

Actions return an update of `state`. 

Actions can:
 - be asynchronous, return Promises and call other actions.
 - return a partial state.

Actions must:
 - return an new object, not mutate the state.

> **Important**
>
> Example declaration:
> `const increment = (state, actions) => (n) => state + n`
> 
> Example call:
> `actions.counter.increment(3)`



### Reducers
A reducer is a collection of actions to manage a part of state.
They allow to organize your code better, splitting logic across separate reusable modules.

An initial state can be provided to define default values for the part of state the reducer manages. If no initial state is provided, the reducer manages the whole state.

Simred exposes a dedicated function to create reducers:
```typescript
 createReducer(actions: any, initialState?: any): Reducer;
```

**Examples:**
A reducer managing only a part of state:
```js
import { createReducer } from 'simred'

const actions = {
  add: (state, actions) => (item) => [...state, item]
}

const initialState = []

export default createReducer(actions, initialState)
```
A reducer managing the whole state:
```js
import { createReducer } from 'simred'

const actions = {
  add: (state, actions) => (item) => ({
    list: [...state.list, item],
    counter: state.list.length + 1
  })
}

export default createReducer(actions)
```

#### Combining reducers
```js
import reducerA from 'reducerA' // Has initialState == []
import reducerB from 'reducerB' // Has initialState == { value: false }

export const rootReducer = {
  a: reducerA,
  b: reducerB
}

// storeState == { a: [], b: { value: false } }
```
Actions from `reducerA` will receive `storeState.a` as `state`.
Actions from `reducerB` will receive `storeState.b` as `state`.

Actions in `reducerB` can only interact with `storeState.a` by calling actions declared in `reducerA` through the `actions` argument.

**Example:**
```js
// reducerA.js

// ...

export default createReducer(
  {
    add: (state, _actions) => (item) => [...state, item]
  },
  // initial state
  []
)
```
```js
// reducerB.js

// ...

export default createReducer(
  {
    setValue: (state, actions) => (value) => {
      // calls "add" from reducerA
      actions.a.add(value) 

      return { value }
    }
  },
  // initial state
  { value: false }
)
```

### Store
Now that we know about actions and reducers, let's bring them all together: that is what the store does.

- The store holds the application state;
- Allows access through `getState()`;
- Allows access to actions (and therefore change the state) through `getActions()`;
- Register listeners through `subscribe()`;
- Registers middlewares thtough `addMiddleware()`;

The store can be created easily once reducers have been combined:
```js
import Simred from 'simred'
import { rootReducer } from './reducers'

const store = Simred.createStore(rootReducer)
```
An initial state can be specified as second argument. This is useful to hydrate the state with user data matching the Simred state from external sources (server, localStorage, ...)
```js
import Simred from 'simred'
import { rootReducer } from './reducers'

const stateFromLocalStorage = JSON.parse(localStorage.getItem['simred_state'])

const store = Simred.createStore(rootReducer, stateFromLocalStorage)
```

#### Calling actions
```js
import { VisiblityFilters } from './filters'

// Log the initial state
console.log(store.getState())

// Every time the state changes, log it
// Note that subscribe() returns a function for unregistering the listener
store.subscribe(state => console.log(state))

const actions = store.actions

// Dispatch some actions
actions.todos.add('Learn about actions'))
actions.todos.add('Learn about reducers'))
actions.todos.add('Learn about store'))
actions.todos.toggle(0)
actions.todos.toggle(1)
actions.visiblityFilter.set(VisibilityFilters.SHOW_COMPLETED)
```

#### Middlewares
Middlewares can be used to intercept actions as they are propagated through the store.
They can be used for a variety of things, such as logging, storing the state, etc.

A middleware consist in a function with signature:
```typescript
(store: Store) => (next: Function) => (action: string, args: any[]) => void
```
Where:
 - `store` is the store, with `.actions`, `.getState()`, etc
 - `next` is the next middleware in the stack, middleware are executed in the same order they added to the store
 - `action` is the name of the part of state and of the function (e.g.: `"todos.add"`)
 - `args` is an array of arguments the action received (e.g.: `["Learn about actions"]`)

 Middleware can be added in one of two ways:
 - using `Simred.createStore(reducers, initialState, middlewares)`, where the third argument is an array of middlewares
 - using `store.addMiddleware(middleware)`, on an existing store

Here is an example of a logging middleware:
```js
// The middleware itself
const logger = store => next => (action, arts) => {
  console.log({ action, args })

  next() // Calls the next middleware on the stack
})

// add it at store creation time
const store = Simred.createStore(reducers, {}, [logger])

// OR after the fact
store.addMiddleware(logger)
```
---
## Complete Example: To-do List
Let's design a store for a simple to-do list manager.

Todos belongs a single list troughout the application.
The have a text and a completed status.

We want the following functionalities:
- add a todo to the list of todos;
- toggle the completed status of a given todo;
- show either: all todos, completed todos, or remaining todos.

### Designing the state
We'll use Typescript™ notation for easy reading.

We identified two types of entities: 
- todos
- visibility filer

We'll need two parts of state, and therefore, two reducers:
```typescript
// One Todo item
interface Todo {
  text: string
  completed: boolean
}

// Visibility Filter constants
type VisibilityFilter = "SHOW_COMPLETED" | "SHOW_REMAINING" | "SHOW_ALL"

// Shape of the Application State
interface State {
  todos: Todo[]
  visibilityFilter: VisiblityFilter
}
```

### The Todo Reducer
```js
// todoReducer.js
import { createReducer } from 'simred'

/* Initial state for todos: an empty list */
const INITIAL_STATE = []

const actions = {
  /* appends a new todo to the list, completed defaults to false */
  add: (state) => (text) => [...state, { text, completed: false }],
  /* toggles the completed flag of the todo at index */
  toggle: (state) => (index) => {
    return state.map((todo, i) => {
      if (i == index) {
        return { ...todo, completed: !todo.completed }
      }
      else {
        return todo
      }
    })
  }
}

export const todoReducer = createReducer(actions, INITIAL_STATE)
```
### The Visibility Filter Reducer
```js
// filters.js

/* Constants for the visibility filter */
export const VisibilityFilters = {
  SHOW_COMPLETED: "SHOW_COMPLETED",
  SHOW_REMAINING: "SHOW_REMAINING",
  SHOW_ALL: "SHOW_ALL",
}
```
```js
// visibilityFilterReducer.js
import { createReducer } from 'simred'
import { VisibilityFilters } from './filters'

// The application will show all todos by default
const INITIAL_STATE = VisibilityFilter.SHOW_ALL

const actions = {
  /* changes the value of the visibilty filter */
  set: () => (filter) => filter
}

export const visibilityFilterReducer = createReducer(actions, INITIAL_STATE)
```
### The Root Reducer
```js
// reducers.js
import { todoReducer } from 'todoReducer'
import { visibilityFilterReducer } from 'visibilityFilterReducer'

/**
 * the todoReducer will manage the part of state 'todos'
 * the visibilityFilterReducer will manage the part of state 'visibilityFilter'
 */
export const rootReducer = {
  todos: todoReducer,
  visibilityFilter: visibilityFilterReducer
}
```
### The Store
```js
// store.js
import Simred from 'simred'
import { rootReducer } from './reducers'

const store = Simred.createStore(rootReducer)

// log all changes to the state
store.subscribe(state => console.log(state))

export default store
```
### A test program
```js
// index.js
import store from 'store'

const actions = store.actions

actions.todos.add('Learn about actions'))
actions.todos.add('Learn about reducers'))
actions.todos.add('Learn about store'))
actions.todos.toggle(0)
actions.todos.toggle(1)
actions.visiblityFilter.set(VisibilityFilters.SHOW_COMPLETED)
```
Console:
```text
{ todos: [ { text: "Learn about actions", completed: false } ], visibilityFilter: "SHOW_ALL" }
{ todos: [ { text: "Learn about actions", completed: false }, { text: "Learn about reducers", completed: false } ], visibilityFilter: "SHOW_ALL" }
{ todos: [ { text: "Learn about actions", completed: false }, { text: "Learn about reducers", completed: false }, { text: "Learn about store", completed: false } ], visibilityFilter: "SHOW_ALL" }
{ todos: [ { text: "Learn about actions", completed: true }, { text: "Learn about reducers", completed: false }, { text: "Learn about store", completed: false } ], visibilityFilter: "SHOW_ALL" }
{ todos: [ { text: "Learn about actions", completed: true }, { text: "Learn about reducers", completed: true }, { text: "Learn about store", completed: false } ], visibilityFilter: "SHOW_ALL" }
{ todos: [ { text: "Learn about actions", completed: true }, { text: "Learn about reducers", completed: false }, { text: "Learn about store", completed: false } ], visibilityFilter: "SHOW_COMPLETED" }
```
---
## Usage with React
See the [react-simred]() project to learn how to use Simred with React
## License

MIT © [Gaël PHILIPPE](https://github.com/gaelph)
