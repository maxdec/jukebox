'use strict';

var EventEmitter = require('events').EventEmitter;
var objectAssign = require('object-assign');
var redis = require('../redis');
var trackBuilder = require('../track_builder');
var key = 'jukebox:current';

module.exports = objectAssign({}, EventEmitter.prototype, {
  get: function (callback) {
    redis.get(key, function (err, current) {
      if (err) return callback(err);
      if (!current) return callback();
      callback(null, trackBuilder.fromJSONSync(current));
    });
  },

  set: function (track, callback) {
    callback = callback || function () {};
    redis.set(key, JSON.stringify(track), function (err) {
      if (err) return callback(err);
      this.emit('created', track);
      callback();
    }.bind(this));
  },

  remove: function (callback) {
    callback = callback || function () {};
    redis.del(key, function (err) {
      if (err) return callback(err);
      this.emit('removed');
      callback();
    }.bind(this));
  },

  updateCurrentPosition: function (pos, total, callback) {
    callback = callback || function () {};
    this.get(function (err, current) {
      if (err) return callback(err);
      if (!current) return callback();
      current.position = pos;
      current.total = total;
      redis.set(key, JSON.stringify(current), function (err) {
        if (err) return callback(err);
        this.emit('position', Math.round(pos / total * 100));
        callback();
      }.bind(this));
    }.bind(this));
  }
});
