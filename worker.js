'use strict';

var tracklist = require('./tracklist');
var player = require('./player');

function loop() {
  tracklist.current()
  .then(function (track) {
    if (!track) return setTimeout(loop, 1000);
    process.send({
      type: 'play',
      msg: track.title
    });
    return player.play(track)
    .then(function () {
      return tracklist.next();
    })
    .then(function () {
      setTimeout(loop, 1000);
    });
  })
  .fail(function (err) {
    process.send({
      type: 'error',
      msg: err
    });
    setTimeout(loop, 1000);
  });
}

loop();
