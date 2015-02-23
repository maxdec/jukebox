'use strict';

var EventEmitter = require('events').EventEmitter;
var objectAssign = require('object-assign');
var redis = require('../redis');
var key = 'jukebox:votes';

module.exports = objectAssign({}, EventEmitter.prototype, {
  count: function (callback) {
    redis.scard(key, function (err, count) {
      if (err) return callback(err);
      callback(null, count);
    });
  },

  create: function (uid, callback) {
    callback = callback || function () {};
    redis.sadd(key, uid, function (err, newCount) {
      if (err) return callback(err);
      this.emit('created', newCount);
      callback();
    }.bind(this));
  },

  remove: function (uid, callback) {
    callback = callback || function () {};
    redis.srem(key, uid, function (err, removedCount) {
      if (err) return callback(err);
      this.emit('removed', removedCount);
      callback();
    }.bind(this));
  },

  clear: function (callback) {
    callback = callback || function () {};
    redis.del(key, function (err) {
      if (err) return callback(err);
      this.emit('cleared');
      callback();
    }.bind(this));
  }
});
