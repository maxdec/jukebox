'use strict';

var cp = require('child_process');
var socket = require('./socket')();
var tracklist = require('./tracklist');
var worker;
var state = {
  playing: false,
  auto: false // auto-reload a dead worker
};

function start() {
  console.log('Worker started.');
  worker = cp.fork('./worker');
  attachEvents();
}

function stop() {
  worker.kill();
}

function attachEvents() {
  worker.on('error', function (err) {
    console.log('Worker Error:', err);
    stop();
    if (state.auto) start();
  });

  worker.on('exit', function () {
    state.playing = false;
    if (state.auto) start();
  });

  worker.on('message', function (m) {
    state.playing = true;
    if (m.type === 'progression') {
      socket.emit('progression', Math.round(m.current / m.total * 100));
      tracklist.setCurrentPosition(m.current);
    } else if (m.type === 'play') {
      tracklist.current().then(function (track) {
        socket.emit('play', track);
      });
    } else {
      console.log('Message from Worker:', m);
    }
  });
}

module.exports = {
  start: start,
  stop: stop,
  state: function () { return state; },
  setAuto: function (bool) { state.auto = bool; },
};
