'use strict';

var Q = require('q');
var config = require('./config');
var sourcesMap = {};
var sources = config.sources.map(function (sourceName) {
  sourcesMap[sourceName] = require('./sources/' + sourceName);
  return require('./sources/' + sourceName);
});

module.exports = {
  fromString: fromString,
  fromObjectSync: fromObjectSync,
  fromJSONSync: fromJSONSync
};

/**
 * Checks the sources to find which one the input matches.
 * Then returns a Promise resolving to a Track of the matched source.
 * Input is a String (track url).
 */
function fromString(input) {
  var source;
  var found = sources.some(function (src) {
    if (src.detectOnInput(input)) {
      source = src;
      return true;
    }
  });

  if (!found) {
    return Q.fcall(function () {
      throw new Error('The input does not match any sources.');
    });
  }

  return source.resolve(input);
}

/**
 * Returns a Track of the correct source.
 * Input is a JS object.
 */
function fromObjectSync(object) {
  return new sourcesMap[object.platform].Track(object);
}

/**
 * Returns a Track of the correct source.
 * Input is an JSON string (ie. from Redis).
 */
function fromJSONSync(string) {
  return fromObjectSync(JSON.parse(string));
}
