'use strict';

angular.module('jukebox')
.filter('duration', function () {
  return function (input) {
    var s = Math.floor(input / 1000);
    var h = Math.floor(s / 3600);
    var m = Math.floor(s / 60) % 60;
    s = s % 60;

    // Formatting
    s = s < 10 ? '0' + s : s;
    m = m < 10 ? '0' + m : m;

    var result = '';
    if (h) result += h + ':';
    result += m + ':' + s;

    return result;
  };
});
