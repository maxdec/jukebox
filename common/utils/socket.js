'use strict';

var socket = require('socket.io-client')();

$(window).on('beforeunload', function () {
  console.log('Bye bye...');
  socket.close();
});

module.exports = socket;
