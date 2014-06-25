'use strict';

var lame = require('lame');
var Speaker = require('speaker');
var https = require('https');
var ytdl = require('ytdl');
var ffmpeg = require('fluent-ffmpeg');
var Q = require('q');
var url = require('url');
var credentials = require('./credentials');

var regexRange = new RegExp(/bytes (\d+)-(\d+)\/(\d+)/);

function playSoundcloud(streamUrl, position) {
  var deferred = Q.defer();
  streamUrl += '?client_id=' + credentials.soundcloud.client_id;
  var parsedUrl = url.parse(streamUrl);
  var options = {
    hostname: parsedUrl.hostname,
    path: parsedUrl.path,
    headers: {}
  };

  if (position) {
    options.headers.Range = ['bytes=', position, '-'].join('');
  } else {
    options.headers.Range = 'bytes=0-';
  }

  var req = https.get(options, function (res) {
    if (res.statusCode > 300 && res.statusCode < 400 && res.headers.location) {
      return deferred.resolve(playSoundcloud(res.headers.location, position));
    }

    // Content-Range: bytes 20962036-61451700/61451701
    var splits = regexRange.exec(res.headers['content-range']);
    var totalLength = parseInt(splits[3], 10);
    var currentLength = parseInt(splits[1], 10);
    res.on('data', function (data) {
      currentLength += data.length;
      process.send({
        type: 'progression',
        current: currentLength,
        total: totalLength
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
    return playSoundcloud(track.streamUrl, track.position);
  } else if (track.platform === 'youtube') {
    return playYoutube(track.streamUrl);
  } else {
    return Q.fcall(function () {
      throw new Error('Wrong URL or domain not supported.');
    });
  }
};
