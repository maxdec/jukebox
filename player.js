'use strict';

var lame = require('lame');
var Speaker = require('speaker');
var https = require('https');
var ytdl = require('ytdl');
var ffmpeg = require('fluent-ffmpeg');
var Q = require('q');
var credentials = require('./credentials');

function playSoundcloud(streamUrl) {
  var deferred = Q.defer();
  streamUrl += '?client_id=' + credentials.soundcloud.client_id;
  var req = https.get(streamUrl, function (res) {
    if (res.statusCode > 300 && res.statusCode < 400 && res.headers.location) {
      return deferred.resolve(playSoundcloud(res.headers.location));
    }

    var totalLength = parseInt(res.headers['content-length'], 10);
    var currentLength = 0;
    res.on('data', function (data) {
      currentLength += data.length;
      process.send({
        type: 'progression',
        msg: Math.round(100 * currentLength/totalLength)
      });
    });

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

function playYoutube(trackUrl) {
  var deferred = Q.defer();

  var stream = ytdl(trackUrl, {
    quality: 'highest',
    filter: function(format) { return format.container === 'mp4'; }
  });
  stream
  .on('error', function (err) {
    process.send({
      type: 'error',
      msg: err
    });
    deferred.reject(err);
  })
  .on('end', function () {

  });

  var lameStream = new lame.Decoder();
  var speaker;
  lameStream
  .on('format', function (format) {
    speaker = new Speaker(format);
    speaker.on('close', function () {
      deferred.resolve();
    });
    this.pipe(speaker);
  })
  .on('error', function (err) {
    speaker.end();
    deferred.reject(err);
  })
  .on('end', function () {
    speaker.end();
  });

  new ffmpeg({ source: stream })
    .withNoVideo()
    .withAudioCodec('libmp3lame')
    .toFormat('mp3')
    .on('error', function (err) {
      process.send({
        type: 'error',
        msg: err
      });
      // this.kill('SIGSTOP');
      deferred.reject(err);
    })
    .on('end', function () {

    })
    .writeToStream(lameStream, { end: true });

  return deferred.promise;
}

exports.play = function play(track) {
  if (track.platform === 'soundcloud') {
    return playSoundcloud(track.streamUrl);
  } else if (track.platform === 'youtube') {
    return playYoutube(track.streamUrl);
  } else {
    return Q.fcall(function () {
      throw new Error('Wrong URL or domain not supported.');
    });
  }
};
