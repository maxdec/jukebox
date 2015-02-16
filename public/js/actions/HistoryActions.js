'use strict';

var AppDispatcher = require('../dispatcher/AppDispatcher');
var HistoryConstants = require('../constants/HistoryConstants');
var api = require('../utils/api');

var HistoryActions = {
  fetch: function () {
    api.history.get(function (err, tracks) {
      if (err) return console.error(err);
      HistoryActions.set(tracks);
    }.bind(this));
  },
  set: function (tracks) {
    AppDispatcher.handleViewAction({
      actionType: HistoryConstants.HISTORY_SET,
      data: tracks
    });
  }
};

module.exports = HistoryActions;
