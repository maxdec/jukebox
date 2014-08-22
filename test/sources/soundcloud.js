'use strict';

var assert = require('assert');
var soundcloud = require('../../core/sources/soundcloud');

describe('SoundcloudTrack', function () {
  var jsonTrack = {
    title: 'this is a title',
    user: {
      username: 'this is a artist'
    },
    duration: 12334,
    permalink_url: 'http://track.com/track',
    stream_url: 'http://track.com/stream',
    artwork_url: 'http://track.com/cover.png'
  };
  var track = new soundcloud.Track(jsonTrack);

  it('should have all the fields defined', function () {
    assert.equal(jsonTrack.title,         track.title);
    assert.equal(jsonTrack.user.username, track.artist);
    assert.equal(jsonTrack.duration,      track.duration);
    assert.equal(jsonTrack.permalink_url, track.url);
    assert.equal(jsonTrack.stream_url,    track.streamUrl);
    assert.equal(jsonTrack.artwork_url,   track.cover);
    assert.equal('soundcloud',            track.platform);
    assert.ok(track.createdAt);
  });

  describe('#play()', function () {
    it('should return false for a base track', function () {
      // assert.ok(track.play());
    });
  });
});
