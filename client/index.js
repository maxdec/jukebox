import 'babel-core/polyfill';

import React from 'react';
import { Provider } from 'react-redux';
import ReactDOM from 'react-dom';
import Immutable from 'immutable';
import { ReduxRouter } from 'redux-router';

import configureStore from '../common/stores/configureStore';

const initialState = Immutable.fromJS(window.__INITIAL_STATE__);
const store = configureStore(initialState);
const rootElement = document.getElementById('app');

ReactDOM.render(
  <Provider store={store}>
    <ReduxRouter />
  </Provider>,
  rootElement
);
