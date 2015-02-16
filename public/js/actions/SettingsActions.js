'use strict';

var AppDispatcher = require('../dispatcher/AppDispatcher');
var SettingsConstants = require('../constants/SettingsConstants');

var SettingsActions = {
  load: function () {
    var settings = JSON.parse(localStorage.getItem('settings') || '{}');
    AppDispatcher.handleViewAction({
      actionType: SettingsConstants.SETTINGS_SET_ALL,
      data: settings
    });
  },
  set: function (setting, value) {
    AppDispatcher.handleViewAction({
      actionType: SettingsConstants.SETTINGS_SET,
      data: { setting: setting, value: value }
    });
  },
};

module.exports = SettingsActions;
