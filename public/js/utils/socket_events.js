'use strict';

var socket = require('./socket');
var CurrentActions = require('../actions/CurrentActions');
var TracklistActions = require('../actions/TracklistActions');
var VotesActions = require('../actions/VotesActions');
var SettingsStore = require('../stores/SettingsStore');
var TracklistStore = require('../stores/TracklistStore');
var VotesStore = require('../stores/VotesStore');
var notify = require('../utils/notify');
var socket = require('../utils/socket');

socket.on('current:set', _onCurrentSet);
socket.on('current:removed', _onCurrentRemoved);
socket.on('current:position', _onCurrentPosition);
socket.on('listeners:created', _onListenerNew);
socket.on('listeners:removed', _onListenerRemoved);
socket.on('votes:created', _onVoteNew);
socket.on('votes:removed', _onVoteRemoved);
socket.on('tracklist:created', _onTracklistCreated);
socket.on('tracklist:removed', _onTracklistRemoved);

function _onCurrentSet (track) {
  if (SettingsStore.get('notify')) notify('New track playing', track.title);
  CurrentActions.set(track);
}

function _onCurrentRemoved () {
  CurrentActions.set({});
}

function _onCurrentPosition (perc) {
  CurrentActions.progress(perc);
}

function _onListenerNew (count) {
  var votes = VotesStore.get();
  votes.total += count;
  VotesActions.set(votes);
}

function _onListenerRemoved (count) {
  var votes = VotesStore.get();
  votes.total -= count;
  VotesActions.set(votes);
}

function _onVoteNew (count) {
  var votes = VotesStore.get();
  votes.favorable += count;
  VotesActions.set(votes);
}

function _onVoteRemoved (count) {
  var votes = VotesStore.get();
  votes.favorable -= count;
  VotesActions.set(votes);
}

function _onTracklistCreated (track) {
  TracklistActions.add(track);
  if (SettingsStore.get('notify')) {
    notify('New track added to the tracklist', track.title);
  }
}

function _onTracklistRemoved () {
  var tracks = TracklistStore.get();
  tracks.shift();
  TracklistActions.set(tracks);
}
