'use strict';

var lame = require('lame');
var Speaker = require('speaker');
var unirest = require('unirest');
var https = require('https');
var ytdl = require('ytdl');
var ffmpeg = require('fluent-ffmpeg');
var Q = require('q');
var urlParser = require('url');

function resolveSoundcloud(trackUrl) {
  var deferred = Q.defer();

  unirest.get('https://api.soundcloud.com/resolve.json')
  .query({
    client_id: 'e3a269fc6e454e830d57b8f19a39adf3',
    url: trackUrl
  })
  .end(function (response) {
    var streamUrl = response.body.stream_url;
    streamUrl += '?client_id=e3a269fc6e454e830d57b8f19a39adf3';
    deferred.resolve(streamUrl);
  });

  return deferred.promise;
}

function playSoundcloud(streamUrl) {
  var deferred = Q.defer();

  var req = https.get(streamUrl, function (res) {
    if (res.statusCode > 300 && res.statusCode < 400 && res.headers.location) {
      return deferred.resolve(playSoundcloud(res.headers.location));
    }

    var totalLength = parseInt(res.headers['content-length'], 10);
    var currentLength = 0;
    res.on('data', function (data) {
      currentLength += data.length;
      console.log('Progress: ', Math.round(100 * currentLength/totalLength), '%');
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
    console.log('ERR YTLD', err);
    deferred.reject(err);
  })
  .on('end', function () {
    console.log('END YTLD');
  });

  var lameStream = new lame.Decoder();
  var speaker;
  lameStream
  .on('format', function (format) {
    speaker = new Speaker(format);
    speaker.on('close', function () {
      console.log('END SPEAKER');
      deferred.resolve();
    });
    this.pipe(speaker);
  })
  .on('error', function (err) {
    // this.end();
    speaker.end();
    deferred.reject(err);
  })
  .on('end', function () {
    console.log('END LAME');
    speaker.end();
  });

  new ffmpeg({ source: stream })
    .withNoVideo()
    .withAudioCodec('libmp3lame')
    .toFormat('mp3')
    .on('error', function (err) {
      console.log('ERR FFMPEG', err);
      // this.kill('SIGSTOP');
      deferred.reject(err);
    })
    .on('end', function () {
      console.log('END FFMPEG');
    })
    .writeToStream(lameStream, { end: true });

  return deferred.promise;
}

exports.play = function play(urlStr) {
  var url = urlParser.parse(urlStr, true, true);

  if (url.hostname.indexOf('soundcloud.com') > -1) {
    return resolveSoundcloud(urlStr)
    .then(function (streamUrl) {
      return playSoundcloud(streamUrl);
    });
  } else if (url.hostname.indexOf('youtube.com') > -1) {
    return playYoutube(urlStr);
  } else {
    return Q.fcall(function () {
      throw new Error('Wrong URL or domain not supported.');
    });
  }
};
