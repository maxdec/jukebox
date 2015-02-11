'use strict';

var cp = require('child_process');
var config = require('./config');
var PassThrough = require('stream').PassThrough;
var stream = new PassThrough();
var eventHandlers = config.eventHandlers.map(function (eventHandlerName) {
  return require('./event_handlers/' + eventHandlerName);
});
var worker;
var state = require('./player_state');

function start() {
  if (worker) {
    state.running = true;
    return;
  }

  var args = [__dirname + '/player_worker.js'];
  worker = cp.spawn(process.execPath, args, {
    stdio: [0, 'pipe', 2, 'ipc'],
    cwd: __dirname
  });
  _attachEvents();
  _attachOutputs();
  state.running = true;
}

function _attachEvents() {
  worker.on('exit', function (code, sig) {
    console.log('CHILD EXIT', code, sig);
    state.playing = false;
    state.running = false;
    worker = null;
    if (config.autoReload) start();
  });

  worker.on('error', function (err) {
    console.log('Worker Error:', err);
    worker.kill();
    worker = null;
  });

  worker.on('message', function (m) {
    if (m.type === 'error') {
      console.error(m.msg);
    } else if (m.type === 'log' ) {
      console.log(m.msg);
    }
  });

  eventHandlers.forEach(function (eventHandler) {
    if (worker) eventHandler(worker);
  });
}

function _attachOutputs() {
  if (worker) worker.stdout.pipe(stream, { end: false });
}

module.exports = {
  start: start,
  stop: function stop() { if (worker) worker.kill(); },
  state: function state() { return state; },
  setAuto: function setAuto(bool) { config.autoReload = bool; },
  stream: stream
};

start();
