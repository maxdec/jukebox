'use strict';

var EventEmitter = require('events').EventEmitter;
var objectAssign = require('object-assign');
var redis = require('../redis').client;
var logger = require('../logger');
var key = 'jukebox:listeners';

var listenersRes = [];

module.exports = objectAssign({}, EventEmitter.prototype, {
  getAllSync: function () {
    return listenersRes;
  },

  count: function (callback) {
    redis.scard(key, function (err, count) {
      if (err) return callback(err);
      callback(null, count);
    });
  },

  add: function (uid, res, callback) {
    callback = callback || function () {};
    logger.log('Adding listener');
    listenersRes.push(res);
    redis.sadd(key, uid, function (err, newCount) {
      if (err) return callback(err);
      this.emit('created', newCount);
      callback();
    }.bind(this));
  },

  remove: function (uid, res, callback) {
    callback = callback || function () {};
    logger.log('Removed listener. ' + listenersRes.length + ' are left.');
    var idx = listenersRes.indexOf(res);
    listenersRes.splice(idx, 1);
    redis.srem(key, uid, function (err, removedCount) {
      if (err) return callback(err);
      this.emit('removed', removedCount);
      callback();
    }.bind(this));
  }
});
