'use strict';

var EventEmitter = require('events').EventEmitter;
var objectAssign = require('object-assign');
var redis = require('../redis');
var trackBuilder = require('../track_builder');
var key = 'jukebox:tracklist';

module.exports = objectAssign({}, EventEmitter.prototype, {
  find: function (query, callback) {
    var start = query.start || 0;
    var stop = query.stop || -1;
    redis.lrange(key, start, stop, function (err, tracks) {
      if (err) return callback(err);
      tracks = tracks.map(trackBuilder.fromJSONSync);
      callback(null, tracks);
    });
  },

  create: function (track, callback) {
    callback = callback || function () {};
    redis.rpush(key, JSON.stringify(track), function (err) {
      if (err) return callback(err);
      this.emit('created', track);
      callback();
    }.bind(this));
  },

  /**
   * Blocking!
   * Removes and returns the first track in the tracklist,
   * or waits for a new one to be added.
   */
  waitForNext: function (callback) {
    redis.blpop(key, 0, function (err, results) {
      if (err) return callback(err);
      // Returns an array [key, value]
      var track = trackBuilder.fromJSONSync(results[1]);
      this.emit('removed', track);
      callback(null, track);
    }.bind(this));
  }
});
