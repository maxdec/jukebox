'use strict';
/* global AppDispatcher */
/* global CurrentConstants */
/* global api */

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
  },
  voteNext: function() {
    api.current.post(function (err) {
      if (err) console.error(err);
    });
  },
  setVotes: function (votes) {
    AppDispatcher.handleViewAction({
      actionType: CurrentConstants.CURRENT_SET_VOTES,
      data: votes
    });
  },
};
