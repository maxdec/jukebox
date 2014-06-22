'use strict';

var io;

module.exports = function (server) {
  if (server) io = require('socket.io')(server);
  return io;
};
