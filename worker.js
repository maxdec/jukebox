'use strict';

var tracklist = require('./tracklist');
var player = require('./player');

var retries = 0;
var maxRetries = 3;

function loop() {
  tracklist.current()
  .then(function (track) {
    if (!track) return tracklist.waitForNext().then(doLoop);

    process.send({
      type: 'play',
      msg: track.title
    });
    return player.play(track)
    .then(tracklist.next)
    .then(doLoop);
  })
  .fail(function (err) {
    process.send({
      type: 'error',
      msg: err.toString()
    });

    if (++retries >= maxRetries) {
      retries = 0;
      return tracklist.next().then(doLoop);
    }

    doLoop();
  });
}

function doLoop() {
  setImmediate(loop);
}

doLoop();
