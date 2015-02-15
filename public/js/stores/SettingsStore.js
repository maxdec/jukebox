'use strict';
/* global AppDispatcher */
/* global SettingsConstants */

var EventEmitter = window.ReactFlux.EventEmitter;
var merge = window.ReactFlux.Merge;

var SettingsStore = merge(EventEmitter.prototype, {
  _settings: JSON.parse(localStorage.getItem('settings') || '{"notify": false, "autoplay": false}'),

  get: function (setting) {
    return this._settings[setting];
  },

  getAll: function () {
    return this._settings;
  },

  _set: function (setting, value) {
    this._settings[setting] = value;
  },

  _setAll: function (settings) {
    Object.keys(settings).forEach(function (key) {
      this._set(key, settings[key]);
    }.bind(this));
  },

  emitChange: function () {
    this.emit('change');
  },

  addChangeListener: function(callback) {
    this.on('change', callback);
  },

  removeChangeListener: function(callback) {
    this.removeListener('change', callback);
  }
});

SettingsStore.dispatchToken = AppDispatcher.register(function(payload) {
  var action = payload.action;

  switch(action.actionType) {
    case SettingsConstants.SETTINGS_SET:
      SettingsStore._set(action.data.setting, action.data.value);
      break;

    case SettingsConstants.SETTINGS_SET_ALL:
      SettingsStore._setAll(action.data);
      break;

    default:
      return true;
  }

  SettingsStore.emitChange();
  localStorage.setItem('settings', JSON.stringify(SettingsStore.getAll()));

  return true;
});
