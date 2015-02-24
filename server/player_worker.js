'use strict';

var Q = require('q');
var config = require('./config');
var retries = 0;
var logger = require('./logger');

var tracklist = require('./services/tracklist');
var current = require('./services/current');
var next = require('./next');
// Send services events through redis pub/sub
require('./redis_events');

function loop() {
  current.get(function (err, track) {
    if (err) return failure(err);
    if (!track) return waitForNext().then(immediateLoop);

    logger.log('Playing: ' + track.title);
    track.on('progress', _progressListener);

    play(track, function (err) {
      if (err) return failure(err);
      logger.log('End of track:' + track.title);
      next(function (err) {
        if (err) return failure(err);
        immediateLoop();
      });
    });
  });
}

immediateLoop();

function immediateLoop() {
  setImmediate(loop);
}

function play(track, callback) {
  track.play()
    .on('error', function (err) {
      callback(err);
    })
    .on('end', function () {
      callback();
    })
    .pipe(process.stdout);
}

function waitForNext() {
  var deferred = Q.defer();
  tracklist.waitForNext(function (err, track) {
    if (err) return deferred.reject(err);
    track.playedAt = new Date();
    current.set(track, function (err) {
      if (err) return deferred.reject(err);
      deferred.resolve(track);
    });
  });

  return deferred.promise;
}

function failure(err) {
  logger.error(err);

  if (++retries >= config.maxRetries) {
    retries = 0;
    next(function (err) {
      if (err) return logger.error(err);
      immediateLoop();
    });

    return;
  }

  immediateLoop();
}

function _progressListener(data) {
  current.updateCurrentPosition(data.current, data.total);
}

process.on('uncaughtException', function(err) {
  logger.log('Caught exception: ' + err);
});
