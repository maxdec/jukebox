'use strict';

var AppDispatcher = require('../dispatcher/AppDispatcher');
var PlayerConstants = require('../constants/PlayerConstants');
var EventEmitter = require('events').EventEmitter;
var objectAssign = require('object-assign');

var PlayerStore = objectAssign({}, EventEmitter.prototype, {
  _audio: null,
  _streamUrl: '//vagrant:3000/stream?cache-buster=' + Date.now(),
  _playing: false,
  _volume: 0.5,

  isPlaying: function () {
    return !!this._playing;
  },

  getVolume: function () {
    return this._volume * 100;
  },

  _reset: function (streamUrl) {
    this._stop();
    this._play(streamUrl);
  },

  _play: function (streamUrl) {
    if (this._audio) return;

    this._streamUrl = streamUrl || this._streamUrl;
    this._audio = new Audio();
    this._audio.src = this._streamUrl;
    this._audio.volume = this._volume;
    this._audio.play();
    this._playing = true;
    this._attachEvents();
  },

  _stop: function () {
    this._playing = false;
    if (this._audio) {
      this._audio.pause();
      this._audio.src = '';
      this._removeEvents();
      this._audio = null;
    }
  },

  _setVolume: function (perc) {
    if (typeof perc === 'number') {
      this._volume = perc / 100;
      if (this._audio) this._audio.volume = perc / 100;
    }
  },

  _attachEvents: function () {
    this._audio.addEventListener('error', this._onError.bind(this));
    this._audio.addEventListener('pause', this._onPause.bind(this));
    this._audio.addEventListener('playing', this._onPlaying.bind(this));
  },

  _removeEvents: function () {
    this._audio.removeEventListener('error', this._onError.bind(this));
    this._audio.removeEventListener('pause', this._onPause.bind(this));
    this._audio.removeEventListener('playing', this._onPlaying.bind(this));
  },

  _onError: function (err) {
    console.error('Player error', err);
  },

  _onPause: function () {
    this._playing = false;
  },

  _onPlaying: function () {
    this._playing = true;
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

    case PlayerConstants.PLAYER_STOP:
      PlayerStore._stop();
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
