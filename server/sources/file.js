'use strict';

var util = require('util');
var urlParser = require('url');
var Throttle = require('throttle');
var Track = require('../track');
var Q = require('q');
var fs = require('fs');
var url = require('url');
var mm = require('musicmetadata');

module.exports = {
  Track: FileTrack,
  detectOnInput: detectOnInput,
  resolve: resolve
};

/**
 * File Track
 */
function FileTrack(track) {
  if (track.platform) _initFromInternal.apply(this, arguments);
  else _initFromExternal.apply(this, arguments);
}
util.inherits(FileTrack, Track);

/**
 * Returns a stream with the mp3 data from the filesystem.
 * Emits `progression` events.
 */
FileTrack.prototype.play = function play() {
  var parsedUrl = url.parse(this.streamUrl);
  var options = {};
  if (this.position) options.start = this.position;

  var output = new Throttle(320*1000/8); // throttle at 128kbps

  fs.createReadStream(parsedUrl.path, options)
    .pipe(output);

  var currentLength = this.position || 0;
  var totalLength = this.size;

  output.on('data', function (chunk) {
    currentLength += chunk.length;
    process.send({
      type: 'progression',
      current: currentLength,
      total: totalLength
    });
  });

  process.send({
    type: 'progression',
    current: currentLength,
    total: totalLength
  });

  return output;
};

/**
 * Detects if the input match this source.
 */
function detectOnInput(input) {
  var url = urlParser.parse(input, true, true);
  return (url.protocol.indexOf('file') > -1);
}

/**
 * Fetches the full track object from the Filesystem.
 * Returns a Promise resolving to a FileTrack.
 * TODO: read ID3 tags
 */
function resolve(trackUrl) {
  var deferred = Q.defer();
  var url = urlParser.parse(trackUrl, true, true);

  fs.stat(url.path, function (err, stats) {
    if (err) return deferred.reject(err);
    if (!stats.isFile()) return deferred.reject('This is not a track.');
    var track = new FileTrack({
      title: _getFileName(url.path),
      size: stats.size,
      path: url.path
    });

    var stream = fs.createReadStream(url.path);
    var parser = mm(stream, { duration: true });

    parser.on('metadata', function (metadata) {
      track.title = metadata.title;
      track.artist = metadata.artist.join(' ');
      track.duration = metadata.duration * 1000;
    });

    parser.on('done', function (err) {
      if (err) return deferred.reject(err);
      stream.destroy();
      deferred.resolve(track);
    });
  });

  return deferred.promise;
}

/**
 * Private helpers
 */
function _initFromExternal(track) {
  /* jshint validthis:true */
  this.title     = track.title;
  this.artist    = track.artist;
  this.duration  = track.duration;
  this.streamUrl = track.path;
  this.cover     = track.artwork_url;
  this.createdAt = new Date();
  this.platform  = 'file';
}

function _initFromInternal() {
  /* jshint validthis:true */
  FileTrack.super_.apply(this, arguments);
}

function _getFileName(path) {
  var parts = path.split('/');
  return parts[parts.length - 1];
}
