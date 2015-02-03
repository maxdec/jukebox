'use strict';

angular.module('jukebox')
.factory('state', [function () {

  var state = {
    local: false, // true if playing the music locally
  };

  return state;
}]);
