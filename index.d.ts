interface ReducerDescriptor {
  actions: Reducer,
  state?: any
}

type Reducer = any

export interface Store<T, R> {
  actions: R
  getState(): T
  subscribe(listener: (state: T) => void): void
  addMiddleware(middleware: (store: Store<T, R>) => (next: () => void) => (actionName: string, paylaod: any) => void): void
}

  
export function createReducer(reducer: Reducer, initialState?: any, middlewares?: ((store: Store<any, any>) => (next: () => void) => (actionName: string, paylaod: any) => void)[]): ReducerDescriptor

export function getState(): any
export function getActions(): any


export namespace Simred {
  export function createStore<R, S>(reducers: R, initialState?: S): Store<S, R>
}

declare const simred: typeof Simred

export default simred