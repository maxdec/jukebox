'use strict';

var urlParser = require('url');

function Track(fullTrack) {
  this.title = fullTrack.title.$t || fullTrack.title;
  if (fullTrack.user) {
    this.artist = fullTrack.user.username;
  } else if (fullTrack.author && fullTrack.author[0]) {
    fullTrack.artist = fullTrack.author[0].name.$t;
  } else {
    this.artist = fullTrack.artist;
  }
  this.duration = fullTrack.duration || fullTrack.media$group.yt$duration.seconds * 1000;
  this.url = fullTrack.permalink_url || fullTrack.url || fullTrack.link[0].href;
  this.streamUrl = fullTrack.stream_url || fullTrack.streamUrl || fullTrack.link[0].href;
  this.cover = fullTrack.artwork_url || fullTrack.cover || fullTrack.media$group.media$thumbnail[1].url;
  this.platform = fullTrack.platform || detectPlatform(this.url);
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
