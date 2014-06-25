'use strict';

var urlParser = require('url');

function Track(fullTrack) {
  this.title = fullTrack.title;
  if (fullTrack.user) {
    this.artist = fullTrack.user.username;
  } else {
    this.artist = fullTrack.artist;
  }
  this.duration = fullTrack.duration;
  this.url = fullTrack.permalink_url || fullTrack.url;
  this.streamUrl = fullTrack.stream_url || fullTrack.streamUrl;
  this.cover = fullTrack.artwork_url || fullTrack.cover;
  this.platform = fullTrack.platform || detectPlatform(fullTrack.stream_url);
  this.createdAt = new Date();
  this.playedAt = fullTrack.playedAt;
  this.position = fullTrack.position;
}

function detectPlatform(urlStr) {
  if (!urlStr) return;
  var url = urlParser.parse(urlStr, true, true);
  if (url.hostname.indexOf('soundcloud.com') > -1) {
    return 'soundcloud';
  } else if (url.hostname.indexOf('youtube.com') > -1) {
    return 'youtube';
  }
}

module.exports = Track;
