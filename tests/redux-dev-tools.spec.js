import '../__mocks__/redux_dev_tools_extension'
import devToolsMiddleware, { DevTools } from '../src/redux-dev-tools'

describe('redux dev tools middleware', function () {
  it('is available in test', function () {
    expect(typeof devToolsMiddleware).toBe('function')
  })

  it('inits', function () {
    DevTools.init = jest.fn(DevTools.init)

    const store = {
      getState: () => ({ state: 'state' })
    }

    const next = () => { }

    devToolsMiddleware(store)(next)('@@init', [store.getState()])

    expect(DevTools.init).toHaveBeenCalled()
  })

  it('sends', function () {
    DevTools.send = jest.fn(DevTools.send)

    const store = {
      getState: () => ({ state: 'state' })
    }

    const next = () => { }

    devToolsMiddleware(store)(next)('UPDATE', [{ state: 'update' }])

    expect(DevTools.send).toHaveBeenCalled()
  })

  it('subscribes', function (done) {
    DevTools.subscribe = jest.fn(DevTools.subscribe)
    const callback = jest.fn(() => done())

    DevTools.subscribe(callback)

    expect(callback).toHaveBeenCalled()
  })
})