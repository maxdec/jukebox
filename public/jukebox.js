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
  $locationProvider.hashPrefix('#');
}])

.controller('MainCtrl', ['$scope', function ($scope) {
  $scope.currentTrack = {
    title: 'Octopus\'s Garden',
    artist: 'The Beatles',
    duration: '2\'51"'
  };

  $scope.trackList = [{
    title: 'I Want You (She\'s So Heavy)',
    artist: 'The Beatles',
    duration: '7\'47"'
  }, {
    title: 'Play With Fire',
    artist: 'The Rolling Stones',
    duration: '2\'14"'
  }];

  $scope.addTrack = function () {
    console.log($scope.newTrack);
    $scope.trackList.push({
      title: 'New Track',
      artist: 'That Artist',
      duration: '0\'00"'
    });
    $scope.newTrack = null;
  };
}]);
