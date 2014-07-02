'use strict';
/**
 * JS
 */

angular.module('jukebox')
.factory('Volume', ['$resource', function ($resource) {
  return $resource('/volume');
}]);
