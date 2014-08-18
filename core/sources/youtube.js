'use strict';

var util = require('util');
var urlParser = require('url');
var Track = require('../track');
var Q = require('q');
var unirest = require('unirest');
var ytdl = require('ytdl-core');
var Transcoder = require('stream-transcoder');
var format = require('../config').format;

module.exports = {
  Track: YoutubeTrack,
  detectOnInput: detectOnInput,
  resolve: resolve
};

/**
 * Youtube Track
 */
function YoutubeTrack(track) {
  if (track.platform) _initFromInternal.apply(this, arguments);
  else _initFromExternal.apply(this, arguments);
}
util.inherits(YoutubeTrack, Track);

/**
 * Plays the sound of a Youtube video.
 * It streams the content, removes the video
 * and encode the sound into mp3.
 * Emits `progression` events.
 *
 * /!\ Resuming a video is (currently?) not possible.
 * When using the `range` option Youtube just returns a chunk a data
 * which is not recognized as a valid video.
 * cf. https://github.com/fent/node-ytdl/issues/32
 */
YoutubeTrack.prototype.play = function play() {
  var totalLength;
  var currentLength = 0;

  var ytOpts = {
    quality: 'highest',
    // filter: function(format) { return format.container === 'mp4'; }
  };
  if (this.position) ytOpts.range = this.position + '-';

  var ytStream = ytdl(this.streamUrl, ytOpts);
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
    .on('error', function () {
      ytStream.push(null);
    })
    .on('end', function () {});

  return new Transcoder(ytStream)
    .custom('vn') // no video
    .audioCodec('libmp3lame')
    .sampleRate(format.sampleRate)
    .channels(format.channels)
    .audioBitrate(format.bitRate)
    .format('mp3')
    .stream();
};

/**
 * Detects if the input match this source.
 */
function detectOnInput(input) {
  var url = urlParser.parse(input, true, true);
  if (!url.hostname) return false;
  return (url.hostname.indexOf('youtube.com') > -1);
}

/**
 * Fetches the full track object from the Youtube API.
 * Returns a Promise resolving to a YoutubeTrack.
 */
function resolve(trackUrl) {
  var deferred = Q.defer();
  var url = urlParser.parse(trackUrl, true, true);

  unirest.get('http://gdata.youtube.com/feeds/api/videos/' + url.query.v)
  .query({
    v: 2,
    alt: 'json'
  })
  .end(function (response) {
    if (response.error) return deferred.reject(response.error);
    deferred.resolve(new YoutubeTrack(response.body.entry));
  });

  return deferred.promise;
}

/**
 * Private helpers
 */
function _initFromExternal(track) {
  /* jshint validthis:true */
  this.title     = track.title.$t;
  if (track.author && track.author[0]) {
    track.artist = track.author[0].name.$t;
  }
  this.duration  = track.media$group.yt$duration.seconds * 1000;
  this.url       = track.link[0].href;
  this.streamUrl = track.link[0].href;
  this.cover     = track.media$group.media$thumbnail[1].url;
  this.createdAt = new Date();
  this.platform  = 'youtube';
}

function _initFromInternal() {
  /* jshint validthis:true */
  YoutubeTrack.super_.apply(this, arguments);
}
