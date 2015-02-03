'use strict';

angular.module('jukebox')
.factory('Player', ['$q',
           function ($q) {

  var streamUrl = '/stream';
  var audio = new Audio(streamUrl);
  audio.volume = 0.5;

  var player = {
    playing: false, // Is the local speaker playing?
    play: function () {
      var deferred = $q.defer();
      audio.play();
      player.playing = true;
      deferred.resolve(true);

      return deferred.promise;
    },
    pause: function () {
      var deferred = $q.defer();
      audio.pause();
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
      var deferred = $q.defer();
      if (typeof perc === 'number'){
        audio.volume = perc / 100;
        deferred.resolve(perc);
      } else {
        deferred.resolve(audio.volume * 100);
      }

      return deferred.promise;
    }
  };

  return player;
}]);
