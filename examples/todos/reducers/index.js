import { TodoReducer } from './todoReducer'
import { FilterReducer } from './filterReducer'
import { TodoEditReducer } from './todoEditReducer'
import { TodoCreatorReducer } from './todoCreatorReducer'
import { RouterReducer, RouterInitialState } from 'simred-router'

import { withInitialState } from 'simred'


export default {
  router: withInitialState(RouterInitialState)(RouterReducer),
  todoEdit: TodoEditReducer,
  todoCreate: TodoCreatorReducer,
  todos: TodoReducer,
  filter: FilterReducer
}