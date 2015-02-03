'use strict';
/* global io */

angular.module('jukebox')
.factory('socket', ['$rootScope', '$q',
           function ($rootScope,   $q) {

  var expose = {};
  var deferred = $q.defer();
  var s = deferred.promise; // promise

  expose.init = function () {
    if (!expose.initialized) {
      var socket = io();
      expose.initialized = true;
      deferred.resolve(socket);
    }
  };

  expose.on = function (eventName, callback) {
    s.then(function (socket) {
      socket.on(eventName, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    });
  };

  expose.emit = function (eventName, data, callback) {
    s.then(function (socket) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      });
    });
  };

  return expose;
}]);
