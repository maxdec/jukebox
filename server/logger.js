'use strict';

function log() {
  if (process.send) {
    var args = Array.prototype.slice.call(arguments);
    process.send({
      type: 'log',
      msg: args.join(' ')
    });
  } else {
    console.log.apply(null, arguments);
  }
}

function error() {
  if (process.send) {
    process.send({
      type: 'error',
      msg: arguments.join(' ')
    });
  } else {
    console.error(arguments);
  }
}

function onMsg(data) {
  if (data.type === 'error') {
    console.error(data.msg);
  } else if (data.type === 'log' ) {
    console.log(data.msg);
  }
}

module.exports = {
  log: log,
  error: error,
  onMsg: onMsg
};
