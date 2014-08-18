'use strict';

var http = require('http');
var Q = require('q');
var lame = require('lame');
var Speaker = require('speaker');
var STREAM_URL = 'http://localhost:3000/player/stream';

function play(url) {
  var deferred = Q.defer();
  var req = http.get(url, function (res) {
    if (res.statusCode >= 300) return deferred.resolve();

    res.pipe(new lame.Decoder())
    .on('format', function (format) {
      this.pipe(new Speaker(format));
    })
    .on('end', function () {
      deferred.resolve();
    });
  });

  req.end();

  return deferred.promise;
}

function loop() {
  play(STREAM_URL)
  .then(function () {
    setImmediate(loop);
  })
  .fail(function () {
    setImmediate(loop);
  });
}

setImmediate(loop);
