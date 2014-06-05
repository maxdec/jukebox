'use strict';

var tracklist = require('./tracklist');
var player = require('./player');

function loop() {
  console.log('loop!');
  tracklist.first()
  .then(function (trackUrl) {
    if (!trackUrl) return setTimeout(loop, 1000);
    console.log('PLAY', trackUrl);
    return player.play(trackUrl)
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

tracklist.clear()
.then(function () {
  return;// tracklist.fillWithExamples();
})
.then(function () {
  loop();
});
