'use strict';

var stream = require('stream');
var socket = require('../socket')();
/**
 * Needs to return an Stream writable.
 */
var progress = new stream.PassThrough();
progress.current = 0;
progress.total = 0;

progress.on('data', function (chunk) {
  progress.current += chunk.length;
  process.send({
    type: 'progression',
    current: progress.current,
    total: progress.total
  });
});

module.exports = decoder;
