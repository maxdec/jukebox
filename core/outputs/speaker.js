'use strict';

var lame = require('lame');
var Speaker = require('speaker');

/**
 * Needs to return an Stream writable.
 */
var decoder = new lame.Decoder();
decoder.on('format', function (format) {
  this.pipe(new Speaker(format));
});

module.exports = decoder;
