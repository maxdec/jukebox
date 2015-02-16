'use strict';

var AppDispatcher = require('../dispatcher/AppDispatcher');
var TracklistConstants = require('../constants/TracklistConstants');

var EventEmitter = window.ReactFlux.EventEmitter;
var merge = window.ReactFlux.Merge;

var TracklistStore = merge(EventEmitter.prototype, {
  _tracks: [],

  get: function() {
    return this._tracks;
  },

  _set: function (tracks) {
    this._tracks = tracks;
  },

  _add: function (track) {
    this._tracks.push(track);
  },

  _remove: function (index) {
    return this._tracks.splice(index, 1);
  },

  emitChange: function() {
    this.emit('change');
  },

  addChangeListener: function(callback) {
    this.on('change', callback);
  },

  removeChangeListener: function(callback) {
    this.removeListener('change', callback);
  }
});

TracklistStore.dispatchToken = AppDispatcher.register(function(payload) {
  var action = payload.action;

  switch(action.actionType) {
    case TracklistConstants.TRACKLIST_SET:
      TracklistStore._set(action.data);
      break;

    case TracklistConstants.TRACKLIST_ADD:
      TracklistStore._add(action.data);
      break;

    case TracklistConstants.TRACKLIST_REMOVE:
      TracklistStore._remove(action.data);
      break;

    default:
      return true;
  }

  TracklistStore.emitChange();

  return true;
});

module.exports = TracklistStore;
