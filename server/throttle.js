'use strict';

module.exports = function throttle(fn, duration) {
  var lock;
  return function () {
    if (lock) return;
    fn.apply(this, arguments);
    lock = setTimeout(function () {
      lock = null;
    }, duration);
  };
};
