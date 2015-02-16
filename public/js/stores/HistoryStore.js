'use strict';

var AppDispatcher = require('../dispatcher/AppDispatcher');
var HistoryConstants = require('../constants/HistoryConstants');

var EventEmitter = window.ReactFlux.EventEmitter;
var merge = window.ReactFlux.Merge;

var HistoryStore = merge(EventEmitter.prototype, {
  _tracks: [],

  get: function() {
    return this._tracks;
  },

  _set: function (tracks) {
    this._tracks = tracks.sort(function (a, b) {
      return (new Date(b.playedAt) - new Date(a.playedAt));
    });
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

HistoryStore.dispatchToken = AppDispatcher.register(function(payload) {
  var action = payload.action;

  switch(action.actionType) {
    case HistoryConstants.HISTORY_SET:
      HistoryStore._set(action.data);
      break;

    default:
      return true;
  }

  HistoryStore.emitChange();

  return true;
});

module.exports = HistoryStore;
