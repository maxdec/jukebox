'use strict';
/**
 * JS
 */

angular.module('jukebox')
.controller('MainCtrl', ['$scope', '$location', 'Player', 'socket',
                function ($scope,   $location,   Player,   socket) {
  $scope.$location = $location;
  $scope.Player = Player;
  Player.play();
  socket.init();

  $scope.bookmarklet = 'javascript:(function(){var e=window.location.href;if(e.indexOf(\'soundcloud\')===-1&&e.indexOf(\'youtube\')===-1){return}var t=new XMLHttpRequest;var n=JSON.stringify({url:e});t.open(\'POST\',\'http://' + location.host + '/tracks\',true);t.setRequestHeader(\'Content-Type\',\'application/json\');t.onload=function(){if(t.readyState===4){if(t.status===200||t.status===201)alert(\'Added!\');else alert(\'Error!\')}};t.onerror=function(){console.error(t.statusText)};t.send(n)})()';

  Player.volume().then(function (vol) {
    $scope.volume = vol;
  });

  $scope.$watch('volume', function (perc) {
    if (!perc) return;
    Player.volume(perc);
  });
}])

.controller('PlayingCtrl', ['$scope', '$window', 'Tracks', 'socket', 'Votes',
                   function ($scope,   $window,   Tracks,   socket,   Votes) {
  $scope.tracks = [];
  $scope.progression = {
    width: '0%'
  };
  $scope.votes = {
    favorable: 0,
    total: 3
  };

  socket.on('progression', function (progression) {
    $scope.progression.width = progression + '%';
  });

  socket.on('play', function (track) {
    $scope.currentTrack = track;
    $scope.tracks.shift();
    $scope.votes.favorable = 0;
  });

  socket.on('new track', function (track) {
    $scope.tracks.push(track);
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

  Votes.get().$promise
  .then(function (votes) {
    $scope.votes = votes;
  });

  socket.on('new vote', function (count) {
    $scope.votes.favorable += count;
  });

  $scope.next = function () {
    Tracks.next().$promise
    .then(function (track) {
      $scope.currentTrack = track;
      $scope.tracks.shift();
    });
  };

  $scope.addTrack = function () {
    Tracks.save({ url: $scope.newTrack });
    $scope.newTrack = null;
  };

  $scope.openExt = function (url) {
    $window.open(url, '_blank');
  };

  $scope.voteNext = function () {
    Votes.save();
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
