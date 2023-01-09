import { createStore, applyMiddleware, Store } from 'redux'
import thunk from 'redux-thunk'
import { composeWithDevTools } from 'redux-devtools-extension'
import reducer from './reducers'

let store: Store
const middleware = applyMiddleware(thunk)
const middlewares = process.env.NODE_ENV !== 'production' ? composeWithDevTools(middleware) : middleware
const configureStore = (initialState: Object) => {
  if (!store) {
    store = createStore(reducer, initialState, middlewares)
  }
  return store
}

export default configureStore
