'use strict';
/**
 * JS
 */

angular.module('jukebox')
.controller('MainCtrl', ['$scope', '$location', 'Player', 'socket',
                function ($scope,   $location,   Player,   socket) {
  $scope.$location = $location;
  socket.init();

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

.controller('PlayingCtrl', ['$scope', '$window', 'Tracks', 'socket',
                   function ($scope,   $window,   Tracks,   socket) {
  $scope.tracks = [];
  $scope.progression = {
    width: '0%'
  };

  socket.on('progression', function (progression) {
    $scope.progression.width = progression + '%';
  });

  socket.on('play', function (track) {
    $scope.currentTrack = track;
    // $scope.tracks.shift();
  });

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

  $scope.openExt = function (url) {
    $window.open(url, '_blank');
  };
}])

.controller('HistoryCtrl', ['$scope', '$window', '$alert', 'Tracks',
                   function ($scope,   $window,   $alert,   Tracks) {
  Tracks.history().$promise
  .then(function (list) {
    $scope.history = list;
  });

  $scope.addTrack = function (track) {
    Tracks.save({ url: track.url }).$promise
    .then(function () {
      $alert({
        title: 'Track added',
        content: track.title
      });
    });
  };

  $scope.openExt = function (url) {
    $window.open(url, '_blank');
  };
}]);
