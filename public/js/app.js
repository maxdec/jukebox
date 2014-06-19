'use strict';
/**
 * JS
 */

angular.module('jukebox', [
  'ngRoute',
  'ngResource',
  'ngSanitize',
  'ngAnimate',
  'ngTouch'
])

.config(['$routeProvider', '$locationProvider',
function ($routeProvider,   $locationProvider) {
  $locationProvider.html5Mode(true);
  $locationProvider.hashPrefix('!');
}]);
