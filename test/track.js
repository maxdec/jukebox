'use strict';

var assert = require('chai').assert;
var Track = require('../server/track');

describe('Track', function () {
  var jsonTrack = {
    title: 'this is a title',
    artist: 'this is a artist',
    duration: 12334,
    url: 'http://track.com/track',
    streamUrl: 'http://track.com/stream',
    cover: 'http://track.com/cover.png',
    platform: 'this is a plaform',
    createdAt: 123,
    playedAt: 456,
    position: 100,
    size: 1500
  };
  var track = new Track(jsonTrack);

  it('should have all the fields defined', function () {
    assert.equal(jsonTrack.title,     track.title);
    assert.equal(jsonTrack.artist,    track.artist);
    assert.equal(jsonTrack.duration,  track.duration);
    assert.equal(jsonTrack.url,       track.url);
    assert.equal(jsonTrack.streamUrl, track.streamUrl);
    assert.equal(jsonTrack.cover,     track.cover);
    assert.equal(jsonTrack.platform,  track.platform);
    assert.equal(jsonTrack.createdAt, track.createdAt);
    assert.equal(jsonTrack.playedAt,  track.playedAt);
    assert.equal(jsonTrack.position,  track.position);
    assert.equal(jsonTrack.size,      track.size);
  });

  describe('#play()', function () {
    it('should return false for a base track', function () {
      assert.equal(false, track.play());
    });
  });
});
