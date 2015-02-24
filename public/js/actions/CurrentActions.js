'use strict';

var AppDispatcher = require('../dispatcher/AppDispatcher');
var CurrentConstants = require('../constants/CurrentConstants');
var api = require('../utils/api');

var CurrentActions = {
  fetch: function () {
    api.current.get(function (err, track) {
      if (err) return console.error(err);
      CurrentActions.set(track);
    }.bind(this));
  },
  set: function (track) {
    AppDispatcher.handleViewAction({
      actionType: CurrentConstants.CURRENT_SET,
      data: track
    });
  },
  progress: function (perc) {
    AppDispatcher.handleViewAction({
      actionType: CurrentConstants.CURRENT_PROGRESS,
      data: perc
    });
  }
};

module.exports = CurrentActions;
