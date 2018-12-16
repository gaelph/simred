import { TodoReducer } from './todoReducer'
import { FilterReducer } from './filterReducer'
import { TodoEditReducer } from './todoEditReducer'
import { TodoCreatorReducer } from './todoCreatorReducer'
import { RouterReducer, RouterInitialState } from 'simred-router'

import { createReducer } from 'simred'


export default {
  router: createReducer(RouterReducer, RouterInitialState),
  todoEdit: TodoEditReducer,
  todoCreate: TodoCreatorReducer,
  todos: TodoReducer,
  filter: FilterReducer
}