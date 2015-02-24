'use strict';

var AppDispatcher = require('../dispatcher/AppDispatcher');
var VotesConstants = require('../constants/VotesConstants');
var EventEmitter = require('events').EventEmitter;
var objectAssign = require('object-assign');

var VotesStore = objectAssign({}, EventEmitter.prototype, {
  _favorable: 0,
  _total: 0,

  get: function() {
    return {
      favorable: this._favorable,
      total: this._total
    };
  },

  _set: function (votes) {
    this._favorable = votes.favorable;
    this._total = votes.total;
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

VotesStore.dispatchToken = AppDispatcher.register(function (payload) {
  var action = payload.action;

  switch(action.actionType) {
    case VotesConstants.VOTES_SET:
      VotesStore._set(action.data);
      break;

    default:
      return true;
  }

  VotesStore.emitChange();

  return true;
});

module.exports = VotesStore;
