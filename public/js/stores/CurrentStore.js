'use strict';

var AppDispatcher = require('../dispatcher/AppDispatcher');
var CurrentConstants = require('../constants/CurrentConstants');
var EventEmitter = require('events').EventEmitter;
var objectAssign = require('object-assign');

var CurrentStore = objectAssign({}, EventEmitter.prototype, {
  _current: {},

  /**
   * Get the current track.
   * @return {object}
   */
  get: function() {
    return this._current;
  },

  _set: function (track) {
    this._current = track;
  },

  _setVotes: function (nb) {
    if (!this._current || !this._current.votes) return;
    this._current.votes.favorable = nb;
  },

  _progress: function (perc) {
    this._current.progress = perc;
  },

  emitChange: function() {
    this.emit('change');
  },

  /**
   * @param {function} callback
   */
  addChangeListener: function(callback) {
    this.on('change', callback);
  },

  /**
   * @param {function} callback
   */
  removeChangeListener: function(callback) {
    this.removeListener('change', callback);
  }
});

// Register to handle all updates
CurrentStore.dispatchToken = AppDispatcher.register(function(payload) {
  var action = payload.action;

  switch(action.actionType) {
    case CurrentConstants.CURRENT_SET:
      CurrentStore._set(action.data);
      break;

    case CurrentConstants.CURRENT_SET_VOTES:
      CurrentStore._setVotes(action.data);
      break;

    case CurrentConstants.CURRENT_PROGRESS:
      CurrentStore._progress(action.data);
      break;

    default:
      return true;
  }

  // This often goes in each case that should trigger a UI change. This store
  // needs to trigger a UI change after every view action, so we can make the
  // code less repetitive by putting it here.  We need the default case,
  // however, to make sure this only gets called after one of the cases above.
  CurrentStore.emitChange();

  return true; // No errors.  Needed by promise in Dispatcher.
});

module.exports = CurrentStore;
