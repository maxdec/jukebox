'use strict';

var AppDispatcher = require('../dispatcher/AppDispatcher');
var VotesConstants = require('../constants/VotesConstants');
var api = require('../utils/api');

var VotesActions = {
  fetch: function () {
    api.votes.get(function (err, votes) {
      if (err) return console.error(err);
      VotesActions.set(votes);
    }.bind(this));
  },
  set: function (votes) {
    AppDispatcher.handleViewAction({
      actionType: VotesConstants.VOTES_SET,
      data: votes
    });
  },
  doVote: function() {
    api.votes.post(function (err) {
      if (err) console.error(err);
    });
  }
};

module.exports = VotesActions;
