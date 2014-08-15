'use strict';

angular.module('jukebox')
.factory('Player', ['$q', 'RemotePlayer', 'RemoteVolume',
           function ($q,   RemotePlayer,   RemoteVolume) {

  var streamUrl = '/player/stream';
  var LocalPlayer = {
    audio: null,
    play: function () {
      if (!LocalPlayer.audio) LocalPlayer.audio = new Audio(streamUrl);
      LocalPlayer.audio.play();
    },
    pause: function () {
      LocalPlayer.audio.pause();
    },
    stop: function () {
      LocalPlayer.audio = null;
    }
  };

  var player = {
    remote: true, // Are we controlling the remote speaker?
    playing: false, // Is the (remote or local) speaker playing?
    play: function () {
      if (player.remote) {
        return RemotePlayer.play().$promise.then(function () {
          player.playing = true;
        });
      }

      var deferred = $q.defer();
      LocalPlayer.play();
      player.playing = true;
      deferred.resolve(true);

      return deferred.promise;
    },
    pause: function () {
      if (player.remote) {
        return RemotePlayer.pause().$promise.then(function () {
          player.playing = false;
        });
      }

      var deferred = $q.defer();
      LocalPlayer.play();
      player.playing = false;
      deferred.resolve(false);

      return deferred.promise;
    },
    /**
     * Getter/Setter for the (remote or local) volume level.
     * perc - between 0 and 100.
     * Returns a promise.
     */
    volume: function (perc) {
      if (player.remote) {
        if (typeof perc === 'number') return RemoteVolume.save({ perc: perc }).$promise;
        return RemoteVolume.get().$promise;
      }

      var deferred = $q.defer();
      if (typeof perc === 'number'){
        LocalPlayer.audio.volume(perc / 100);
        deferred.resolve(perc);
      } else {
        deferred.resolve(LocalPlayer.audio.volume() * 100);
      }

      return deferred.promise;
    }
  };

  RemotePlayer.get().$promise.then(function (resp) {
    player.playing = resp.playing;
  });

  return player;
}]);
