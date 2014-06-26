'use strict';

var lame = require('lame');
var Speaker = require('speaker');
var https = require('https');
var ytdl = require('ytdl');
var Transcoder = require('stream-transcoder');
var Q = require('q');
var url = require('url');
var credentials = require('./credentials');

var regexRange = new RegExp(/bytes (\d+)-(\d+)\/(\d+)/);
var format = {
  channels: 2,          // 2 channels
  bitDepth: 16,         // 16-bit samples
  sampleRate: 44100     // 44,100 Hz sample rate
};

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
    res.on('data', function (chunk) {
      currentLength += chunk.length;
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

/**
 * Plays the sound of a Youtube video.
 * It streams the content, removes the video
 * and encode the sound into raw PCM (Speaker format)
 *
 * /!\ Resuming a video is (currently?) not possible.
 * When using the `range` option Youtube just returns a chunk a data
 * which is not recognized as a valid video.
 * cf. https://github.com/fent/node-ytdl/issues/32
 */
function playYoutube(trackUrl, position) {
  var deferred = Q.defer();
  var totalLength;
  var currentLength = 0; //position || 0;

  var ytOpts = {
    quality: 'highest',
    // filter: function(format) { return format.container === 'mp4'; }
  };
  if (position) ytOpts.range = position + '-';

  var ytStream = ytdl(trackUrl, ytOpts);
  ytStream
    .on('info', function (_, format) {
      totalLength = parseInt(format.size, 10);
    })
    .on('data', function (chunk) {
      currentLength += chunk.length;
      process.send({
        type: 'progression',
        current: currentLength,
        total: totalLength
      });
    })
    .on('error', function (err) {
      deferred.reject(err);
    })
    .on('end', function () {});

  var speaker = new Speaker(format);
  speaker.on('close', function () {
    deferred.resolve();
  });

  new Transcoder(ytStream)
    .custom('vn')
    .audioCodec('pcm_s16le')
    .channels(format.channels)
    .sampleRate(format.sampleRate)
    .custom('sample_fmt', 's16') // format.bitDepth
    .format('s16le')
    .on('error', function (err) {
      deferred.reject(err);
    })
    .stream().pipe(speaker);

  return deferred.promise;
}

exports.play = function play(track) {
  if (track.platform === 'soundcloud') {
    return playSoundcloud(track.streamUrl, track.position);
  } else if (track.platform === 'youtube') {
    // /!\ It's actually not possible to resume Youtube for now.
    // Read more in the `playYoutube` function description.
    return playYoutube(track.streamUrl);
  } else {
    return Q.fcall(function () {
      throw new Error('Wrong URL or domain not supported.');
    });
  }
};
