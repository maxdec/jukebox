'use strict';

var EventEmitter = require('events').EventEmitter;
var objectAssign = require('object-assign');
var redis = require('../redis').client;
var trackBuilder = require('../track_builder');
var key = 'jukebox:history';

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
  }
});
