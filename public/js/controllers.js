'use strict';
/**
 * JS
 */

angular.module('jukebox')
.controller('MainCtrl', ['$scope', 'Tracks', 'Player',
                function ($scope,   Tracks,   Player) {
  $scope.tracks = [];

  Tracks.query().$promise
  .then(function (list) {
    $scope.tracks = list;
  });

  Tracks.current().$promise
  .then(function (track) {
    $scope.currentTrack = track;
  });

  Tracks.history().$promise
  .then(function (list) {
    $scope.history = list;
  });

  $scope.next = function () {
    Tracks.next().$promise
    .then(function (track) {
      $scope.currentTrack = track;
      $scope.tracks.shift();
    });
  };

  $scope.addTrack = function () {
    Tracks.save({ url: $scope.newTrack }).$promise
    .then(function (track) {
      $scope.tracks.push(track);
    });
    $scope.newTrack = null;
  };

  $scope.playing = false;

  $scope.play = function () {
    Player.play().$promise.then(function () {
      $scope.playing = true;
    });
  };

  $scope.pause = function () {
    Player.pause().$promise.then(function () {
      $scope.playing = false;
    });
  };

  // function setPlaying() {
  //   Player.get().then(function (resp) {
  //     $scope.playing = resp.playing;
  //   });
  // }
}]);
