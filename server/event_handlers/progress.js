'use strict';

var state = require('../player_state');
var socket = require('../socket')();
var tracklist = require('../tracklist');

module.exports = function (m) {
  state.playing = true;
  if (m.type === 'progress') {
    socket.emit('current:progress', Math.round(m.current / m.total * 100));
    tracklist.setCurrentPosition(m.current);
  } else if (m.type === 'play') {
    socket.emit('current:new');
  }
};
