'use strict';
/* global AppDispatcher */
/* global HistoryConstants */
/* global api */

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
