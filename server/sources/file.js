'use strict';

var util = require('util');
var urlParser = require('url');
var Throttle = require('throttle');
var Track = require('../track');
var Q = require('q');
var fs = require('fs');
var url = require('url');
var mm = require('musicmetadata');
var ffprobe = require('node-ffprobe');

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
  //file:///vagrant/jukebox/audio1.mp3
  ffprobe(url.path, function (err, results) {
    if (err) return deferred.reject(err);
    var track = {
      title: results.filename,
      size: results.format.size,
      duration: results.format.duration * 1000,
      path: url.path,
      bitrate: results.format.bit_rate
    };

    var stream = fs.createReadStream(url.path);
    var parser = mm(stream);

    parser.on('metadata', function (metadata) {
      track.title = metadata.title;
      track.artist = metadata.artist.join(' ');
      var pic = metadata.picture[0];
      if (pic) {
        var picPath = 'public/img/covers/' + results.filename.replace(results.fileext, '.' + pic.format);
        track.cover = picPath.replace('public', '');
        var file = fs.createWriteStream(picPath);
        file.end(pic.data);
      }
    });

    parser.on('done', function (err) {
      if (err) return deferred.reject(err);
      stream.destroy();
      deferred.resolve(new FileTrack(track));
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
  this.cover     = track.cover;
  this.createdAt = new Date();
  this.platform  = 'file';
  this.bitrate   = track.bitrate;
}

function _initFromInternal() {
  /* jshint validthis:true */
  FileTrack.super_.apply(this, arguments);
}
