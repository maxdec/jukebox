'use strict';
/* jshint -W079 */

var current = require('./services/current');
var history = require('./services/history');
var votes = require('./services/votes');

module.exports = function next(callback) {
  callback = callback || function () {};
  current.get(function (err, prevTrack) {
    if (err) return callback(err);
    if (prevTrack) {
      history.create(prevTrack, function (err) {
        if (err) return callback(err);
        // Clear the votes and current song
        votes.clear();
        current.remove();
        callback();
      });
    } else {
      votes.clear();
      current.remove();
      callback();
    }
  });
};
