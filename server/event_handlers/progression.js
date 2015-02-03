'use strict';

var state = require('../player_state');
var socket = require('../socket')();
var tracklist = require('../tracklist');

module.exports = function progression(worker) {
  worker.on('message', function (m) {
    state.playing = true;
    if (m.type === 'progression') {
      socket.emit('progression', Math.round(m.current / m.total * 100));
      tracklist.setCurrentPosition(m.current);
    } else if (m.type === 'play') {
      tracklist.current().then(function (track) {
        socket.emit('play', track);
      });
    }
  });
};
