'use strict';
/**
 * JS
 */

angular.module('jukebox')
.controller('MainCtrl', ['$scope', '$location', 'Player',
                function ($scope,   $location,   Player) {
  $scope.$location = $location;

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

  function setPlaying() {
    Player.get().$promise.then(function (resp) {
      $scope.playing = resp.playing;
    });
  }
  setPlaying();
}])

.controller('PlayingCtrl', ['$scope', 'Tracks',
                   function ($scope,   Tracks) {
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
}])

.controller('HistoryCtrl', ['$scope', 'Tracks',
                   function ($scope,   Tracks) {
  Tracks.history().$promise
  .then(function (list) {
    $scope.history = list;
  });
}]);
