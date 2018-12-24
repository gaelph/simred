import { createReducer } from 'simred'

const INITIAL_STATE = {
  newTodo: '',
}

export const TodoCreatorReducer = createReducer({
    setNewTodo: () => (newTodo) => {
      return {
        newTodo
      }
    }
  },
  INITIAL_STATE
)
