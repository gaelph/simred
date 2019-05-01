import { withInitialState } from 'simred'

import { uuid } from '../utils'

export const add = (todos) => (title) => {
  return [...todos, {
    id: uuid(),
    title,
    completed: false
  }]
}

export const toggle = (todos) => (todoToToggle) => {
  return todos.map(todo => {
    if (todo.id == todoToToggle.id) {
      return { ...todo, completed: !todo.completed }
    }
    else {
      return todo
    }
  })
}

export const toggleAll = (todos) => (checked) => {
  return todos.map(todo => ({ ... todo, completed: checked }))
}

export const destroy = (todos) => (todoToDestroy) => {
  return todos.filter(todo => todo.id !== todoToDestroy.id)
}

export const save = (todos) => (todoToSave) => {
  return todos.map(todo => {
    if (todo.id == todoToSave.id) {
      return {... todo, title: todoToSave.title}
    }
    else {
      return todo
    }
  })
}

export const clearCompleted = (todos) => () => {
  return todos.filter(todo => !todo.completed)
}

export const TodoReducer = withInitialState([])(
  {
    add,
    toggle,
    toggleAll,
    save,
    destroy,
    clearCompleted
  }
)