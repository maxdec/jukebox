'use strict';
/**
 * JS
 */

angular.module('jukebox')
.factory('RemoteVolume', ['$resource', function ($resource) {
  return $resource('/volume');
}]);
