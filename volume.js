'use strict';

var exec = require('child_process').exec;

function set(perc) {
  var db = percToDb(perc);
  exec('amixer -c 0 set PCM -- ' + db + 'dB');
}

function percToDb(perc) {
  return Math.round(0.33 * perc - 33);
}

module.exports = set;
