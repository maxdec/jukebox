'use strict';

var util = require('util');
var urlParser = require('url');
var https = require('https');
var Throttle = require('throttle');
var Track = require('../track');
var Q = require('q');
var unirest = require('unirest');
var config = require('../config');
var url = require('url');
var regexRange = new RegExp(/bytes (\d+)-(\d+)\/(\d+)/);

module.exports = {
  Track: SoundcloudTrack,
  detectOnInput: detectOnInput,
  resolve: resolve
};

/**
 * Soundcloud Track
 */
function SoundcloudTrack(track) {
  if (track.platform) _initFromInternal.apply(this, arguments);
  else _initFromExternal.apply(this, arguments);
}
util.inherits(SoundcloudTrack, Track);

/**
 * Returns an mp3 stream from Soundcloud.
 */
SoundcloudTrack.prototype.play = function play() {
  return _download(this.streamUrl, this.position);
};

/**
 * Detects if the input match this source.
 */
function detectOnInput(input) {
  var url = urlParser.parse(input, true, true);
  if (!url.hostname) return false;
  return (url.hostname.indexOf('soundcloud.com') > -1);
}

/**
 * Fetches the full track object from the Soundcloud API.
 * Returns a Promise resolving to a SoundcloudTrack.
 */
function resolve(trackUrl) {
  var deferred = Q.defer();

  unirest.get('https://api.soundcloud.com/resolve.json')
  .query({
    client_id: config.soundcloud.clientId,
    url: trackUrl
  })
  .end(function (response) {
    if (response.error) return deferred.reject(response.error);
    if (response.body.kind !== 'track') {
      return deferred.reject('This is not a track.');
    }
    // Better image resolution
    response.body.artwork_url = response.body.artwork_url.replace('large.jpg', 't300x300.jpg');
    deferred.resolve(new SoundcloudTrack(response.body));
  });

  return deferred.promise;
}

/**
 * Private helpers
 */
function _initFromExternal(track) {
  /* jshint validthis:true */
  this.title     = track.title;
  this.artist    = track.user.username;
  this.duration  = track.duration;
  this.url       = track.permalink_url;
  this.streamUrl = track.stream_url;
  this.cover     = track.artwork_url;
  this.createdAt = new Date();
  this.platform  = 'soundcloud';
}

function _initFromInternal() {
  /* jshint validthis:true */
  SoundcloudTrack.super_.apply(this, arguments);
}

/**
 * Returns a stream with the mp3 data from Soundcloud.
 * Also performs recurrently to follow redirections.
 * Emits `progression` events.
 */
function _download(streamUrl, position) {
  streamUrl += '?client_id=' + config.soundcloud.clientId;
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

  var output = new Throttle(128*1000/8); // throttle at 128kbps

  https.get(options, function (res) {
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
      return _download(res.headers.location, position).pipe(output);
    } else if (res.statusCode >= 400 ) {
      // 404 or whatever, we skip
      return;
    }

    // Content-Range: bytes 20962036-61451700/61451701
    var totalLength, currentLength;
    if (res.headers['content-range']) {
      var splits = regexRange.exec(res.headers['content-range']);
      totalLength = parseInt(splits[3], 10);
      currentLength = parseInt(splits[1], 10);
    } else {
      totalLength = res.headers['content-length'];
      currentLength = 0;
    }

    process.send({
      type: 'progression',
      current: currentLength,
      total: totalLength
    });

    res.on('data', function (chunk) {
      currentLength += chunk.length;
      process.send({
        type: 'progression',
        current: currentLength,
        total: totalLength
      });
    }).pipe(output);

  }).end();

  return output;
}
