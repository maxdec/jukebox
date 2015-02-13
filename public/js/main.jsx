'use strict';
/* global io */
/* global App */

window.socket = io.connect();

React.render(
  <App />,
  document.getElementById('app')
);
