import { createReducer } from 'simred'

import { uuid } from '../utils'



export const add = (todos, actions, title) => {
  return [...todos, {
    id: uuid(),
    title,
    completed: false
  }]
}

export const toggle = (todos, actions, todoToToggle) => {
  return todos.map(todo => {
    if (todo.id == todoToToggle.id) {
      return { ...todo, completed: !todo.completed }
    }
    else {
      return todo
    }
  })
}

export const toggleAll = (todos, actions, checked) => {
  return todos.map(todo => ({ ... todo, completed: checked }))
}

export const destroy = (todos, actions, todoToDestroy) => {
  return todos.filter(todo => todo.id !== todoToDestroy.id)
}

export const save = (todos, actions, todoToSave) => {
  return todos.map(todo => {
    if (todo.id == todoToSave.id) {
      return {... todo, title: todoToSave.title}
    }
    else {
      return todo
    }
  })
}

export const clearCompleted = (todos, actions) => {
  return todos.filter(todo => !todo.completed)
}

export const TodoReducer = createReducer({
  add,
  toggle,
  toggleAll,
  save,
  destroy,
  clearCompleted
}, [])