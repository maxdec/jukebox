'use strict';

var cp = require('child_process');
var worker;
var state = {
  playing: false,
  auto: false // auto-reload a dead worker
};

function start() {
  console.log('Worker started.');
  worker = cp.fork('./worker');
  attachEvents();
  state.playing = true;
}

function stop() {
  worker.kill();
  state.playing = false;
}

function attachEvents() {
  worker.on('error', function (err) {
    worker.kill();
    state.playing = false;
    console.log('Worker Error:', err);
    if (state.auto) start();
  });

  worker.on('exit', function () {
    state.playing = false;
    console.log('Worker stopped.');
    if (state.auto) start();
  });

  worker.on('message', function (m) {
    console.log('Message from Worker:', m);
  });
}

module.exports = {
  start: start,
  stop: stop,
  state: function () { return state; },
  setAuto: function (bool) { state.auto = bool; },
};
