'use strict';
/* jshint -W079 */

var redis = require('./redis').client;

var current = require('./services/current');
var tracklist = require('./services/tracklist');
var history = require('./services/history');
var listeners = require('./services/listeners');
var votes = require('./services/votes');

current.on('set', function (track) {
  redis.publish('current:set', JSON.stringify(track));
});
current.on('removed', function () {
  redis.publish('current:removed', true);
});
current.on('position', function (perc) {
  redis.publish('current:position', perc);
});

tracklist.on('created', function (track) {
  redis.publish('tracklist:created', JSON.stringify(track));
});
tracklist.on('removed', function (track) {
  redis.publish('tracklist:removed', JSON.stringify(track));
});

history.on('created', function (track) {
  redis.publish('history:created', JSON.stringify(track));
});

listeners.on('created', function (count) {
  redis.publish('listeners:created', count);
});
listeners.on('removed', function (count) {
  redis.publish('listeners:removed', count);
});

votes.on('created', function (count) {
  redis.publish('votes:created', count);
});
votes.on('removed', function (count) {
  redis.publish('votes:removed', count);
});
