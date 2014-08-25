'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var assert = chai.assert;
var trackBuilder = require('../core/track_builder');
var soundcloud = require('../core/sources/soundcloud');
var youtube = require('../core/sources/youtube');

describe('Track Builder', function () {
  describe('fromString', function () {
    it('should return a promise which resolves to a Track with the correct platform', function () {
      assert.eventually.typeOf(trackBuilder.fromString('https://soundcloud.com/britneyspears/insideout-snippet'), soundcloud.Track);
      assert.eventually.typeOf(trackBuilder.fromString('http://www.youtube.com/watch?v=TAryFIuRxmQ'), youtube.Track);
    });
    it('should return promise rejected for invalid inputs', function () {
      assert.isRejected(trackBuilder.fromString('http://lol.com#haha'));
    });
  });

  var track = {
    title: 'Inside Out (Snippet)',
    artist: 'Britney Spears',
    duration: 15652,
    url: 'http://soundcloud.com/britneyspears/insideout-snippet',
    streamUrl: 'https://api.soundcloud.com/tracks/11247771/stream',
    cover: 'https://i1.sndcdn.com/artworks-000005191917-gexo9x-t300x300.jpg?e76cf77',
    platform: 'soundcloud'
  };

  describe('fromObject', function () {
    it('should return a promise which resolves to a Track', function () {
      assert.eventually.typeOf(trackBuilder.fromObject(track), soundcloud.Track);
    });
  });

  describe('fromJSON', function () {
    it('should return a promise which resolves to a Track', function () {
      assert.eventually.typeOf(trackBuilder.fromJSON(JSON.stringify(track)), soundcloud.Track);
    });
  });
});
