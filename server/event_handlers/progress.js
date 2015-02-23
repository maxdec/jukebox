'use strict';

var state = require('../player_state');
var current = require('../services/current');

module.exports = function (m) {
  state.playing = true;
  if (m.type === 'progress') {
    current.updateCurrentPosition(m.current, m.total);
  }
};
