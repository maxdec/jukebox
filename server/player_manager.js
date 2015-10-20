import {fork} from 'child_process';
import config from './config';
import {PassThrough} from 'stream';
export const stream = new PassThrough();

let worker;
import state from './player_state';
import * as logger from './logger';

export function start() {
  console.log('Worker started');
  if (worker) {
    state.running = true;
    return;
  }

  worker = fork(__dirname + '/player_worker.js', {
    silent: true,
    cwd: __dirname
  });
  _attachEvents();
  _attachOutputs();
  state.running = true;
}

function _attachEvents() {
  worker.on('exit', function (code, sig) {
    logger.log('CHILD EXIT', code, sig);
    state.playing = false;
    state.running = false;
    worker = null;
    if (config.autoReload) start();
  });

  worker.on('error', function (err) {
    logger.error('Worker Error:', err);
    worker.kill();
    worker = null;
  });

  worker.on('message', logger.onMsg);
}

function _attachOutputs() {
  if (worker) worker.stdout.pipe(stream, { end: false });
}

export function stop() { if (worker) worker.kill(); }
export function setAuto(bool) { config.autoReload = bool; }

if (config.autoReload) start();
