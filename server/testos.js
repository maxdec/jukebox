'use strict';

var EventEmitter = require('events').EventEmitter;

var e = new EventEmitter();
e.ping = function () {
  this.emit('ping');
};

module.exports = e;
