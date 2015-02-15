'use strict';
/* global AppDispatcher */
/* global SettingsConstants */
/* global SettingsStore */

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
