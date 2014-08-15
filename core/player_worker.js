'use strict';

var Q = require('q');
var tracklist = require('./tracklist');
var config = require('./config');
var retries = 0;

function loop() {
  tracklist.current()
  .then(function (track) {
    if (!track) return tracklist.waitForNext().then(immediateLoop);
    process.send({
      type: 'play',
      msg: track.title
    });
    return play(track)
    .then(tracklist.next)
    .then(immediateLoop);
  })
  .fail(function (err) {
    console.log(err);
    process.send({
      type: 'error',
      msg: err.toString()
    });

    if (++retries >= config.maxRetries) {
      retries = 0;
      return tracklist.next().then(immediateLoop);
    }

    immediateLoop();
  });
}


immediateLoop();

function immediateLoop() {
  setImmediate(loop);
}

function play(track) {
  var deferred = Q.defer();

  track.play()
    .on('error', function (err) {
      deferred.reject(err);
    })
    .on('end', function () {
      deferred.resolve();
    })
    .pipe(process.stdout);

  return deferred.promise;
}
