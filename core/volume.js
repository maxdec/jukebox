'use strict';

var exec = require('child_process').exec;
var r = new RegExp(/(-?[0-9]+.[0-9]+)dB/);

/**
 * Reads the data from `amixer` and parse it
 * to get the current volume.
 * /!\ Might break!
 */
exports.get = function get(cb) {
  exec('amixer sget PCM | awk -F"[][]" \'/dB/ { print $4 }\'', function (err, stdout) {
    if (err) return cb(err);
    var lines = stdout.split('\n');
    var db = r.exec(lines[0])[1];
    cb(null, dbToPerc(db));
  });
};

exports.set = function set(perc) {
  var db = percToDb(perc);
  exec('amixer -c 0 set PCM -- ' + db + 'dB');
};

function percToDb(perc) {
  return Math.round(0.33 * perc - 33);
}

function dbToPerc(db) {
  db = parseFloat(db, 10);
  return Math.round(3* (db + 33));
}
