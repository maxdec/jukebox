'use strict';

function Track(fullTrack) {
  this.title     = fullTrack.title;
  this.artist    = fullTrack.artist;
  this.duration  = fullTrack.duration;
  this.url       = fullTrack.url;
  this.streamUrl = fullTrack.streamUrl;
  this.cover     = fullTrack.cover;
  this.platform  = fullTrack.platform;
  this.createdAt = fullTrack.createdAt;
  this.playedAt  = fullTrack.playedAt;
  this.position  = fullTrack.position;
  this.size      = fullTrack.size;
}

Track.prototype.play = function () {
  console.log('Needs to be defined in the children.');
  return false;
};

module.exports = Track;
