'use strict';

var redis = require('redis').createClient();
var Q = require('q');
var Track = require('./track.js');
var keys = {
  tracklist: 'jukebox:tracklist',
  history: 'jukebox:history',
  current: 'jukebox:current',
  votes: 'jukebox:votes'
};

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
  redis.del(keys.tracklist, function (err) {
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

  redis.rpush([keys.tracklist].concat(examples), function (err) {
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
  redis.lrange(keys.tracklist, 0, -1, function (err, list) {
    if (err) return deferred.reject(err);
    return deferred.resolve(list.map(function (trackStr) {
      return new Track(JSON.parse(trackStr));
    }));
  });

  return deferred.promise;
};

/**
 * Get the first track from the tracklist
 */
exports.first = function () {
  var deferred = Q.defer();
  redis.lindex(keys.tracklist, 0, function (err, first) {
    if (err) return deferred.reject(err);
    if (!first) return deferred.resolve();
    return deferred.resolve(new Track(JSON.parse(first)));
  });

  return deferred.promise;
};

/**
 * Append a track to the tracklist
 */
exports.add = function (track) {
  var deferred = Q.defer();
  redis.rpush(keys.tracklist, JSON.stringify(track), function (err) {
    if (err) return deferred.reject(err);
    return deferred.resolve(track);
  });

  return deferred.promise;
};

/**
 * Get the currently played track from the tracklist
 */
exports.current = function () {
  var deferred = Q.defer();
  redis.get(keys.current, function (err, current) {
    if (err) return deferred.reject(err);
    if (!current) return deferred.resolve();
    return deferred.resolve(new Track(JSON.parse(current)));
  });

  return deferred.promise;
};

exports.setCurrentPosition = function (pos) {
  var deferred = Q.defer();
  redis.get(keys.current, function (err, current) {
    if (err) return deferred.reject(err);
    if (!current) return deferred.resolve();
    current = JSON.parse(current);
    current.position = pos;
    redis.set(keys.current, JSON.stringify(current));
    return deferred.resolve();
  });

  return deferred.promise;
};

/**
 * Move the current track to the history.
 * We do NOT move the next one to `current`,
 * the worker will do it with `BLPOP`, which would block
 * the current (server) redis connection otherwise.
 */
exports.next = function () {
  var deferred = Q.defer();
  redis.get(keys.current, function (err, prevTrack) {
    if (err) return deferred.reject(err);
    if (prevTrack) redis.rpush(keys.history, prevTrack);
    // Clear the votes and current song
    redis.del(keys.votes);
    redis.del(keys.current);
    deferred.resolve();
  });

  return deferred.promise;
};

/**
 * Handy method for the worker to wait for a next track.
 */
exports.waitForNext = function () {
  var deferred = Q.defer();
  redis.blpop(keys.tracklist, 0, function (err, res) {
    if (err) return deferred.reject(err);
    // Returns an array [key, value]
    var nextTrack = new Track(JSON.parse(res[1]));
    nextTrack.playedAt = new Date();
    redis.set(keys.current, JSON.stringify(nextTrack), function (err) {
      if (err) return deferred.reject(err);
      deferred.resolve(nextTrack);
    });
  });

  return deferred.promise;
};

/**
 * Get the history of played tracks
 */
exports.history = function () {
  var deferred = Q.defer();
  redis.lrange(keys.history, 0, -1, function (err, list) {
    if (err) return deferred.reject(err);
    return deferred.resolve(list.map(function (trackStr) {
      return new Track(JSON.parse(trackStr));
    }));
  });

  return deferred.promise;
};
