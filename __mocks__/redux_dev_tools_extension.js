window.__REDUX_DEVTOOLS_EXTENSION__ = {
  connect: () => ({
    init: () => { },
    send: () => { },
    subscribe: (listener) => {
        listener({
          type: 'DISPATCH',
          state: {}
        })

        listener({
          type: 'OTHER',
          state: {}
        })
    }
  })
}