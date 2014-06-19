'use strict';

var tracklist = require('./tracklist');
var player = require('./player');

function loop() {
  console.log('loop!');
  tracklist.current()
  .then(function (track) {
    if (!track) return setTimeout(loop, 1000);
    console.log('PLAY', track.title);
    return player.play(track)
    .then(function () {
      return tracklist.next();
    })
    .then(function () {
      setTimeout(loop, 1000);
    });
  })
  .fail(function (err) {
    console.log('BLAKI', err);
    process.send('ERROR CHILD' + err);
    setTimeout(loop, 1000);
  });
}

loop();
