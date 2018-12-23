interface ReducerDescriptor {
  actions: Reducer,
  state?: any
}

type Reducer = any

export interface Store<T> {
  getState(): T
  getActions(): any
  subscribe(listener: (state: any) => void): void
  addMiddleware(middleware: (actionName: string, paylaod: any, next: () => void) => void): void
}

  
export function createReducer(reducer: Reducer, initialState?: any): ReducerDescriptor

export function getState(): any
export function getActions(): any


export namespace Simred {
  export function createStore(reducers: any, initialState?: any): Store<any>
}

declare const simred: typeof Simred

export default simred