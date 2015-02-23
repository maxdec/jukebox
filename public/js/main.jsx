'use strict';
/* global io */

window.socket = io.connect();
$(window).on('beforeunload', function(){
  window.socket.close();
});

var React = require('react/addons');
var App = require('./components/App.jsx');

React.render(
  <App />,
  document.getElementById('app')
);
