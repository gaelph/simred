import { withInitialState } from 'simred'
import { Filters } from '../constants'


export const FilterReducer = withInitialState(Filters.ALL_TODOS)(
  {
    set: () => (filterToSet) => {
      return filterToSet
    },
    updateFromLocation: (filter, actions) => (location) => {
      setTimeout(() => {
        switch (location.pathname) {
          case '/active':
            if (filter != Filters.ACTIVE_TODOS)
              actions.filter.set(Filters.ACTIVE_TODOS)
            break

          case '/completed':
            if (filter != Filters.COMPLETED_TODOS)
              actions.filter.set(Filters.COMPLETED_TODOS)
            break

          default:
            if (filter != Filters.ALL_TODOS)
              actions.filter.set(Filters.ALL_TODOS)
            break
        }
      }, 0)

      return filter
    }
  }
)