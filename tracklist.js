'use strict';

var redis = require('redis').createClient();
var Q = require('q');
var key = 'tracklist';

var examples = [
  'https://soundcloud.com/ghoststoriesmixtape/ghost-stories-ghostface',
  'https://soundcloud.com/2emedanger/danger-live-extract-i',
  'https://www.youtube.com/watch?v=-WiEyVk_ais',
  'https://www.youtube.com/watch?v=FONN-0uoTHI'
];

exports.examples = function () {
  return examples;
};

/**
 * Empty the tracklist
 */
exports.clear = function () {
  var deferred = Q.defer();
  redis.del(key, function (err) {
    if (err) return deferred.reject(err);
    deferred.resolve();
  });

  return deferred.promise;
};

/**
 * Initialize the tracklist with examples
 */
exports.fillWithExamples = function () {
  var deferred = Q.defer();

  redis.rpush([key].concat(examples), function (err) {
    if (err) return deferred.reject(err);
    return deferred.resolve();
  });

  return deferred.promise;
};

/**
 * Get the complete tracklist
 */
exports.get = function () {
  var deferred = Q.defer();
  redis.lrange(key, 0, -1, function (err, list) {
    if (err) return deferred.reject(err);
    return deferred.resolve(list);
  });

  return deferred.promise;
};

/**
 * Get the first track from the tracklist
 */
exports.first = function () {
  var deferred = Q.defer();
  redis.lindex(key, 0, function (err, first) {
    if (err) return deferred.reject(err);
    return deferred.resolve(first);
  });

  return deferred.promise;
};

/**
 * Append a track to the tracklist
 */
exports.add = function (trackUrl) {
  var deferred = Q.defer();
  redis.rpush(key, trackUrl, function (err) {
    if (err) return deferred.reject(err);
    return deferred.resolve();
  });

  return deferred.promise;
};
