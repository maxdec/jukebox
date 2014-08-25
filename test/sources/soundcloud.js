'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var assert = chai.assert;
var soundcloud = require('../../core/sources/soundcloud');

var jsonTrack = {
  title: 'Inside Out (Snippet)',
  user: {
    username: 'Britney Spears'
  },
  duration: 15652,
  permalink_url: 'http://soundcloud.com/britneyspears/insideout-snippet',
  stream_url: 'https://api.soundcloud.com/tracks/11247771/stream',
  artwork_url: 'https://i1.sndcdn.com/artworks-000005191917-gexo9x-t300x300.jpg?e76cf77'
};

describe('Soundcloud Source', function () {

  describe('Track', function () {
    var track = new soundcloud.Track(jsonTrack);

    it('should have all the fields defined', function () {
      assert.equal(track.title,     jsonTrack.title);
      assert.equal(track.artist,    jsonTrack.user.username);
      assert.equal(track.duration,  jsonTrack.duration);
      assert.equal(track.url,       jsonTrack.permalink_url);
      assert.equal(track.streamUrl, jsonTrack.stream_url);
      assert.equal(track.cover,     jsonTrack.artwork_url);
      assert.equal(track.platform, 'soundcloud');
      assert.ok(track.createdAt);
    });

    describe('#play()', function () {
      // Required because not called in a child process.
      process.send = function () {};
      it('should return a stream with the track', function (done) {
        track.play()
        .once('error', function (err) {
          done(err);
        })
        .once('data', function () {
          done();
          this.end();
        });
      });
    });
  });

  describe('detectOnInput', function () {
    it('should return true on a Soundcloud url', function () {
      assert.isTrue(soundcloud.detectOnInput('http://soundcloud.com/tender-games/tender-games-in-her-bed-feat-miss-natnat'));
      assert.isTrue(soundcloud.detectOnInput('https://soundcloud.com/tender-games/tender-games-in-her-bed-feat-miss-natnat'));
      assert.isTrue(soundcloud.detectOnInput('https://api.soundcloud.com/tender-games/tender-games-in-her-bed-feat-miss-natnat'));
    });
    it('should return false if no protocol (e.g. `http`)', function () {
      assert.isFalse(soundcloud.detectOnInput('soundcloud.com/tender-games/tender-games-in-her-bed-feat-miss-natnat'));
    });
    it('should return false for any other url', function () {
      assert.isFalse(soundcloud.detectOnInput('http://youtube.com?v=yusayd7'));
      assert.isFalse(soundcloud.detectOnInput('http://soundcloud2.com?v=yusayd7'));
    });
  });

  describe('resolve', function () {
    it('should return a promise which resolves to a Soundcloud Track', function () {
      assert.eventually.typeOf(soundcloud.resolve('http://soundcloud.com/tender-games/tender-games-in-her-bed-feat-miss-natnat'), soundcloud.Track);
    });
    it('should return a promise which is rejected when not a track', function () {
      assert.isRejected(soundcloud.resolve('https://soundcloud.com/mixmag-1/sets/premiere-roots-panorama-mars-ep'));
      assert.isRejected(soundcloud.resolve('https://youtube.com?v=12345678'));
    });
  });
});
