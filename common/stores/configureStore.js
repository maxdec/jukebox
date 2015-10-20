import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import { reduxReactRouter } from 'redux-router';
import { devTools } from 'redux-devtools';
import rootReducer from '../reducers';
import routes from '../routes';

const createStoreWithMiddleware = compose(
  applyMiddleware(thunk),
  reduxReactRouter({ routes }),
  devTools()
)(createStore);

export default function configureStore(initialState) {
  console.log('debug', initialState);
  const store = createStoreWithMiddleware(rootReducer, initialState);

  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('../reducers', () => {
      const nextRootReducer = require('../reducers');
      store.replaceReducer(nextRootReducer);
    });
  }

  return store;
}
