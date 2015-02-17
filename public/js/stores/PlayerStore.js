'use strict';

var AppDispatcher = require('../dispatcher/AppDispatcher');
var PlayerConstants = require('../constants/PlayerConstants');
var EventEmitter = require('events').EventEmitter;
var objectAssign = require('object-assign');

var PlayerStore = objectAssign({}, EventEmitter.prototype, {
  _audio: new Audio(),
  _playing: false,

  isPlaying: function () {
    return !!this._playing;
  },

  getVolume: function () {
    return this._audio.volume * 100;
  },

  _reset: function (streamUrl) {
    this._streamUrl = streamUrl || this._streamUrl;
    this._audio.src = this._streamUrl;
    this._audio.volume = 0.5;
    this._audio.autoplay = false;
    this._audio.preload = 'none';
    this._audio.pause();
    this._playing = false;
    this._attachEvents();
  },

  _play: function () {
    this._audio.src = this._streamUrl;
    this._playing = true;
    this._audio.play();
  },

  _pause: function () {
    this._audio.pause();
    this._playing = false;
    this._audio.src = '';
  },

  _setVolume: function (perc) {
    if (typeof perc === 'number') this._audio.volume = perc / 100;
  },

  _attachEvents: function () {
    this._audio.addEventListener('error', function onError(err) {
      console.error('Player error', err);
      this._reset(this.streamUrl);
    }.bind(this));

    this._audio.addEventListener('pause', function onPause() {
      this._playing = false;
    }.bind(this));

    this._audio.addEventListener('playing', function onPlaying() {
      this._playing = true;
    }.bind(this));
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
PlayerStore.dispatchToken = AppDispatcher.register(function(payload) {
  var action = payload.action;

  switch (action.actionType) {
    case PlayerConstants.PLAYER_PLAY:
      PlayerStore._play();
      break;

    case PlayerConstants.PLAYER_PAUSE:
      PlayerStore._pause();
      break;

    case PlayerConstants.PLAYER_SET_VOLUME:
      PlayerStore._setVolume(action.data);
      break;

    case PlayerConstants.PLAYER_RESET:
      PlayerStore._reset(action.data);
      break;

    default:
      return true;
  }

  // This often goes in each case that should trigger a UI change. This store
  // needs to trigger a UI change after every view action, so we can make the
  // code less repetitive by putting it here.  We need the default case,
  // however, to make sure this only gets called after one of the cases above.
  PlayerStore.emitChange();

  return true; // No errors.  Needed by promise in Dispatcher.
});

module.exports = PlayerStore;
