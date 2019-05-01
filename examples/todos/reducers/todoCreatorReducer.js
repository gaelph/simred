import { withInitialState } from 'simred'

const INITIAL_STATE = {
  newTodo: '',
}

export const TodoCreatorReducer = withInitialState(INITIAL_STATE)(
  {
    setNewTodo: () => (newTodo) => {
      return {
        newTodo
      }
    }
  }
)
