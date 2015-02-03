'use strict';
/**
 * JS
 */

angular.module('jukebox')
.factory('Votes', ['$resource', function ($resource) {
  return $resource('/votes/:action');
}]);
