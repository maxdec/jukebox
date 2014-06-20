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
  $locationProvider.hashPrefix('!');
  $routeProvider.
    when('/playing', {templateUrl: 'playing.html',   controller: 'PlayingCtrl'}).
    when('/history', {templateUrl: 'history.html',   controller: 'HistoryCtrl'}).
    otherwise({redirectTo: '/playing'});
}]);
