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
    if (config.autoReload) start();
  });

  worker.on('error', function (err) {
    console.log('Worker Error:', err);
    worker.kill();
  });

  worker.on('message', function (m) {
    if (m.type === 'error') {
      console.log(m.msg);
    }
  });

  eventHandlers.forEach(function (eventHandler) {
    eventHandler(worker);
  });
}

function _attachOutputs() {
  worker.stdout.pipe(stream);
}

module.exports = {
  start: start,
  stop: function stop() { if (worker) worker.kill(); },
  state: function state() { return state; },
  setAuto: function setAuto(bool) { config.autoReload = bool; },
  stream: stream
};
