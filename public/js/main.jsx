'use strict';
/* global io */
/* global View */

window.socket = io.connect();

React.render(
  <View />,
  document.getElementById('view')
);
