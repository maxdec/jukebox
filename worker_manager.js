'use strict';

var cp = require('child_process');
var io = require('./socket')();
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
    console.log('Worker stopped.');
    if (state.auto) start();
  });

  worker.on('message', function (m) {
    state.playing = true;
    console.log('Message from Worker:', m);
    if (m.type === 'progression') {
      io.emit('progression', m.msg);
    } else if (m.type === 'play') {
      tracklist.current().then(function (track) {
        io.emit('play', track);
      });
    }
  });
}

module.exports = {
  start: start,
  stop: stop,
  state: function () { return state; },
  setAuto: function (bool) { state.auto = bool; },
};
