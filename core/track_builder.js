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
  fromObject: fromObject,
  fromJSON: fromJSON
};

/**
 * Checks the sources to find which one the input matches.
 * Then returns a Promise resolving to a Track of the matched source.
 * Input is a String (track url).
 */
function fromString(input) {
  var deferred = Q.defer();

  var incorrect = sources.every(function (source) {
    if (source.detectOnInput(input)) {
      source.resolve(input).then(deferred.resolve);
      return false;
    }
    return true;
  });

  if (incorrect) deferred.reject('The input does not match any sources.');

  return deferred.promise;
}

/**
 * Returns a Promise resolving to a Track of the correct source.
 * Input is an object (JSON from Redis).
 */
function fromObject(object) {
  var deferred = Q.defer();
  deferred.resolve(new sourcesMap[object.platform].Track(object));
  return deferred.promise;
}

/**
 * Returns a Promise resolving to a Track of the correct source.
 * Input is an JSON string.
 */
function fromJSON(string) {
  return fromObject(JSON.parse(string));
}
