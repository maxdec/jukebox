'use strict';
/* jshint -W079 */

var socket = require('./socket')();

var current = require('./services/current');
var tracklist = require('./services/tracklist');
var history = require('./services/history');
var listeners = require('./services/listeners');
var votes = require('./services/votes');

current.on('set', function (track) {
  socket.emit('current:set', track);
});
current.on('removed', function () {
  socket.emit('current:removed');
});
current.on('position', function (perc) {
  socket.emit('current:position', perc);
});

tracklist.on('created', function (track) {
  socket.emit('tracklist:created', track);
});
tracklist.on('removed', function (track) {
  socket.emit('tracklist:removed', track);
});

history.on('created', function (track) {
  socket.emit('history:created', track);
});

listeners.on('created', function (count) {
  socket.emit('listeners:created', count);
});
listeners.on('removed', function (count) {
  socket.emit('listeners:removed', count);
});

votes.on('created', function (count) {
  socket.emit('votes:created', count);
});
votes.on('removed', function (count) {
  socket.emit('votes:removed', count);
});
