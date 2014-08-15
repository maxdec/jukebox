'use strict';

var cp = require('child_process');
var socket = require('./socket')();
var tracklist = require('./tracklist');
var config = require('./config');
var outputs = config.outputs.map(function (outputName) {
  return require('./outputs/' + outputName);
});
var worker;
var state = {
  running: false,
  playing: false,
  auto: false // auto-reload a dead worker
};

function start() {
  var args = [__dirname + '/player_worker.js'];
  worker = cp.spawn(process.execPath, args, {
    stdio: [0, 'pipe', 2, 'ipc'],
    cwd: __dirname
  });
  _attachEvents();
  _attachOutputs();
  state.running = true;
}

function stop() {
  if (worker) worker.kill();
}

function _attachEvents() {
  worker.on('error', function (err) {
    console.log('Worker Error:', err);
    stop();
    if (state.auto) start();
  });

  worker.on('exit', function (code, sig) {
    console.log('CHILD EXIT', code, sig);
    state.playing = false;
    state.running = false;
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
    } else if (m.type === 'error') {
      console.log(m.msg);
    } else {
      console.log('Message from Worker:', m);
    }
  });
}

function _attachOutputs() {
  outputs.forEach(function (output) {
    worker.stdout.pipe(output);
  });
}

module.exports = {
  start: start,
  stop: stop,
  state: function () { return state; },
  setAuto: function (bool) { state.auto = bool; }
};
