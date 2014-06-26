'use strict';

var unirest = require('unirest');
var Q = require('q');
var urlParser = require('url');
var credentials = require('./credentials');
var Track = require('./track.js');

function resolveSoundcloud(trackUrl) {
  var deferred = Q.defer();

  unirest.get('https://api.soundcloud.com/resolve.json')
  .query({
    client_id: credentials.soundcloud.client_id,
    url: trackUrl
  })
  .end(function (response) {
    if (response.body.kind !== 'track') {
      return deferred.reject('This is not a track.');
    }
    // Better image resolution
    response.body.artwork_url = response.body.artwork_url.replace('large.jpg', 't300x300.jpg');
    var track = new Track(response.body);
    deferred.resolve(track);
  });

  return deferred.promise;
}

function resolveYoutube(trackId) {
  var deferred = Q.defer();

  unirest.get('http://gdata.youtube.com/feeds/api/videos/' + trackId)
  .query({
    v: 2,
    alt: 'json'
  })
  .end(function (response) {
    var track = new Track(response.body.entry);
    deferred.resolve(track);
  });

  return deferred.promise;
}

exports.resolve = function resolve(urlStr) {
  var url = urlParser.parse(urlStr, true, true);

  if (url.hostname.indexOf('soundcloud.com') > -1) {
    return resolveSoundcloud(urlStr);
  } else if (url.hostname.indexOf('youtube.com') > -1) {
    return resolveYoutube(url.query.v);
  } else {
    return Q.fcall(function () {
      throw new Error('Wrong URL or domain not supported.');
    });
  }
};
