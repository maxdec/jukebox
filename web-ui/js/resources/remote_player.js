'use strict';

angular.module('jukebox')
.factory('RemotePlayer', ['$resource', function ($resource) {
  return $resource('/player', {}, {
    play: {
      method: 'POST'
    },
    pause: {
      method: 'DELETE'
    }
  });
}]);
