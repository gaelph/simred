let devToolsMiddleware
let devTools

/* istanbul ignore else */
if (window.__REDUX_DEVTOOLS_EXTENSION__) {
  devTools = window.__REDUX_DEVTOOLS_EXTENSION__.connect()

  devTools.subscribe((message) => {
    if (message.type === 'DISPATCH' && message.state) {
      console.log('DevTools requested to change the state to', message.state);
    }
  });

  devToolsMiddleware = store => next => (action, payload) => {
    if (action == '@@init') {
      const [state] = payload
  
      devTools.init(state)
    }
    else {
      devTools.send({ type: action, payload }, store.getState())
    }
  
    next()
  }
}
else {
  devToolsMiddleware = () => next => () => next()
}

export const DevTools = devTools

export default devToolsMiddleware