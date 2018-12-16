import { createReducer } from 'simred' 

const INITIAL_STATE = {
  editing: null,
  editText: ''
}

export const TodoEditReducer = createReducer({
  editTodo: (state, actions, todo) => {
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
    updateEditTodo: (state, actions, editText) => {
      return { ...state,
        editText
      }
    }
  },
INITIAL_STATE)