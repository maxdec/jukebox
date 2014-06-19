'use strict';
/**
 * JS
 */

angular.module('jukebox')
.factory('Player', ['$resource', function ($resource) {
  return $resource('/player', {}, {
    play: {
      method: 'POST'
    },
    pause: {
      method: 'DELETE'
    }
  });
}]);
