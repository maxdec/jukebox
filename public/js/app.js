'use strict';
/**
 * JS
 */

angular.module('jukebox', [
  'ngRoute',
  'ngResource',
  'ngSanitize',
  'ngAnimate',
  'ngTouch',
  'mgcrea.ngStrap'
])

.config(['$routeProvider', '$locationProvider',
function ($routeProvider,   $locationProvider) {
  $locationProvider.hashPrefix('!');
  $routeProvider.
    when('/playing', {templateUrl: 'playing',   controller: 'PlayingCtrl'}).
    when('/history', {templateUrl: 'history',   controller: 'HistoryCtrl'}).
    otherwise({redirectTo: '/playing'});
}])
.config(['$alertProvider', function ($alertProvider) {
  angular.extend($alertProvider.defaults, {
    placement: 'top-right',
    type: 'info',
    container: 'body',
    template: 'alert-info',
    duration: 2,
  });
}])
.config(['$compileProvider', function ($compileProvider) {
  /*
    This is required to allow `javascript:` links (bookmarklet).
    They are now disabled by default and appear as 'unsafe'.
    cf. http://stackoverflow.com/questions/15637133/unsafe-link-in-angular
  */
  $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|javascript):/);
}]);
