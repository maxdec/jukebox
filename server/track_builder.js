import config from './config';
const sourcesMap = {};
const sources = config.sources.map(function (sourceName) {
  sourcesMap[sourceName] = require('./sources/' + sourceName);
  return require('./sources/' + sourceName);
});

/**
 * Checks the sources to find which one the input matches.
 * Then returns a Promise resolving to a Track of the matched source.
 * Input is a String (track url).
 */
export function fromString(input) {
  let source;
  var found = sources.some(src => {
    if (src.detectOnInput(input)) {
      source = src;
      return true;
    }
  });

  if (!found) {
    return Promise.reject('The input does not match any sources.');
  }

  return source.resolve(input);
}

/**
 * Returns a Track of the correct source.
 * Input is a JS object.
 */
export function fromObjectSync(object) {
  return new sourcesMap[object.platform].Track(object);
}

/**
 * Returns a Track of the correct source.
 * Input is an JSON string (ie. from Redis).
 */
export function fromJSONSync(string) {
  return fromObjectSync(JSON.parse(string));
}
