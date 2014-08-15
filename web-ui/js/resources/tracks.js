'use strict';
/**
 * JS
 */

angular.module('jukebox')
.factory('Tracks', ['$resource', function ($resource) {
  return $resource('/tracks/:action', {}, {
    current: {
      method: 'GET',
      params: { action: 'current' }
    },
    history: {
      method: 'GET',
      isArray: true,
      params: { action: 'history' }
    },
    next: {
      method: 'POST',
      params: { action: 'next' }
    }
  });
}]);
