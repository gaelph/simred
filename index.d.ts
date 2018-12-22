interface ReducerDescriptor<T> {
  actions: Reducer<T>,
  state?: any
}

type Reducer<T> = {
  [K in keyof T]: (...args: any[]) => void
}

type Payload = any

type ListenerFunction = (state: any) => void
export type MiddlewareFunction = (actionName: string, action: Payload, next: () => void) => void

export interface Store<T> {
  getState(): T
  getActions(): any
  subscribe(listener: ListenerFunction): void
  addMiddleware(middleware: MiddlewareFunction): void
}

// export namespace Simred {
  
  export function createReducer<T>(reducer: T, initialState?: any): ReducerDescriptor<T>

  export function getState(): any
  export function getActions(): any
// }

export namespace Simred {
  export function createStore(reducers: any, initialState?: any): Store<any>
}

declare const simred: typeof Simred

export default simred