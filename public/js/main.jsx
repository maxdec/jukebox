'use strict';
/* global io */

window.socket = io.connect();

var App = require('./components/App.jsx');

React.render(
  <App />,
  document.getElementById('app')
);
