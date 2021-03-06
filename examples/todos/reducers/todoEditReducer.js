import { withInitialState } from 'simred'

const INITIAL_STATE = {
  editing: null,
  editText: ''
}

export const TodoEditReducer = withInitialState(INITIAL_STATE)({
  editTodo: (_state, actions) => (todo) => {
    if (todo) {
        actions.todoEdit.updateEditTodo(todo.title)
        return {
          editing: todo.id,
          // editText: todo.title
        }
      } else {
        return INITIAL_STATE
      }
    },
    updateEditTodo: (state) => (editText) => {
      return { ...state,
        editText
      }
    }
  }
)