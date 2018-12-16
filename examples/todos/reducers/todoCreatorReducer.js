import { createReducer } from 'simred'

const INITIAL_STATE = {
  newTodo: '',
}

export const TodoCreatorReducer = createReducer({
    setNewTodo: (app, actions, newTodo) => {
      return {
        newTodo
      }
    }
  },
  INITIAL_STATE
)
