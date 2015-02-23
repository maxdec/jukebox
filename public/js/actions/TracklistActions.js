'use strict';

var AppDispatcher = require('../dispatcher/AppDispatcher');
var TracklistConstants = require('../constants/TracklistConstants');
var api = require('../utils/api');

var TracklistActions = {
  fetch: function () {
    api.tracks.get(function (err, tracks) {
      if (err) return console.error(err);
      TracklistActions.set(tracks);
    }.bind(this));
  },
  set: function (tracks) {
    AppDispatcher.handleViewAction({
      actionType: TracklistConstants.TRACKLIST_SET,
      data: tracks
    });
  },
  add: function (track) {
    AppDispatcher.handleViewAction({
      actionType: TracklistConstants.TRACKLIST_ADD,
      data: track
    });
  },
  addUrl: function (trackUrl) {
    api.tracks.post({ url: trackUrl }, function (err) {
      if (err) return console.error(err);
    });
  },
  remove: function (index) {
    AppDispatcher.handleViewAction({
      actionType: TracklistConstants.TRACKLIST_REMOVE,
      data: index
    });
  }
};

module.exports = TracklistActions;
