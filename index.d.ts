export namespace Simred {
  interface ReducerDescriptor<T> {
    actions: Reducer<T>,
    state?: any
  }

  type Reducer<T> = {
    [K in keyof T]: (...args: any[]) => void
  }

  type ListenerFunction = (state: any) => void
  type MiddlewareFunction = (actionName: string, action: Payload, next: () => void) => void

  export interface Store {
    getState(): any
    getActions(): any
    subscribe(listener: ListenerFunction): void
    addMiddleware(middleware: MiddlewareFunction): void
  }
  
  export function createReducer<T>(reducer: T, initialState?: any): ReducerDescriptor<T>

  export function getState(): any
  export function getActions(): any
}

export function createStore(reducers: any, initialState?: any): Store