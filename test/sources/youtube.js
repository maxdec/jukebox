'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var assert = chai.assert;
var youtube = require('../../server/sources/youtube');

var jsonTrack = {
  id: {
    '$t': 'tag:youtube.com,2008:video:TAryFIuRxmQ'
  },
  published: {
    '$t': '2011-03-03T09:51:35.000Z'
  },
  updated: {
    '$t': '2014-08-25T12:06:03.000Z'
  },
  category: [{
    scheme: 'http://schemas.google.com/g/2005#kind',
    term: 'http://gdata.youtube.com/schemas/2007#video'
  }, {
    scheme: 'http://gdata.youtube.com/schemas/2007/categories.cat',
    term: 'Comedy',
    label: 'Comedy'
  }],
  title: {
    '$t': 'Slow Clap'
  },
  content: {
    type: 'application/x-shockwave-flash',
    src: 'http://www.youtube.com/v/TAryFIuRxmQ?version=3&f=videos&app=youtube_gdata'
  },
  link: [{
    rel: 'alternate',
    type: 'text/html',
    href: 'http://www.youtube.com/watch?v=TAryFIuRxmQ&feature=youtube_gdata'
  }, {
    rel: 'http://gdata.youtube.com/schemas/2007#video.related',
    type: 'application/atom+xml',
    href: 'http://gdata.youtube.com/feeds/api/videos/TAryFIuRxmQ/related?v=2'
  }, {
    rel: 'http://gdata.youtube.com/schemas/2007#mobile',
    type: 'text/html',
    href: 'http://m.youtube.com/details?v=TAryFIuRxmQ'
  }, {
    rel: 'http://gdata.youtube.com/schemas/2007#uploader',
    type: 'application/atom+xml',
    href: 'http://gdata.youtube.com/feeds/api/users/BRqKw3yhj6c9qQ37FOqY0g?v=2'
  }, {
    rel: 'self',
    type: 'application/atom+xml',
    href: 'http://gdata.youtube.com/feeds/api/videos/TAryFIuRxmQ?v=2'
  }],
  author: [{
    name: { '$t': 'lim1212' },
    uri: { '$t': 'http://gdata.youtube.com/feeds/api/users/lim1212' },
    'yt$userId': { '$t': 'BRqKw3yhj6c9qQ37FOqY0g' }
  }],
  'media$group': {
    'media$description': {
      '$t': 'Wiser\'s slow clap',
      type: 'plain'
    },
    'media$thumbnail': [{
      url: 'http://i.ytimg.com/vi/TAryFIuRxmQ/default.jpg',
      height: 90,
      width: 120,
      time: '00:00:08',
      'yt$name': 'default'
    }, {
      url: 'http://i.ytimg.com/vi/TAryFIuRxmQ/mqdefault.jpg',
      height: 180,
      width: 320,
      'yt$name': 'mqdefault'
    }, {
      url: 'http://i.ytimg.com/vi/TAryFIuRxmQ/hqdefault.jpg',
      height: 360,
      width: 480,
      'yt$name': 'hqdefault'
    }, {
      url: 'http://i.ytimg.com/vi/TAryFIuRxmQ/1.jpg',
      height: 90,
      width: 120,
      time: '00:00:04',
      'yt$name': 'start'
    }, {
      url: 'http://i.ytimg.com/vi/TAryFIuRxmQ/2.jpg',
      height: 90,
      width: 120,
      time: '00:00:08',
      'yt$name': 'middle'
    }, {
      url: 'http://i.ytimg.com/vi/TAryFIuRxmQ/3.jpg',
      height: 90,
      width: 120,
      time: '00:00:12',
      'yt$name': 'end'
    }],
    'media$title': {
      '$t': 'Slow Clap',
      type: 'plain'
    },
    'yt$duration': {
      seconds: '16'
    },
    'yt$videoid': {
      '$t': 'TAryFIuRxmQ'
    }
  }
};

describe('Youtube Source', function () {

  describe('Track', function () {
    var track = new youtube.Track(jsonTrack);

    it('should have all the fields defined', function () {
      assert.equal(track.title,     jsonTrack.title.$t, 'Title not correctly defined.');
      assert.equal(track.artist,    jsonTrack.author[0].name.$t);
      assert.equal(track.duration,  jsonTrack.media$group.yt$duration.seconds * 1000);
      assert.equal(track.url,       jsonTrack.link[0].href);
      assert.equal(track.streamUrl, jsonTrack.link[0].href);
      assert.equal(track.cover,     jsonTrack.media$group.media$thumbnail[1].url);
      assert.equal(track.platform, 'youtube');
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
        });
      });
    });
  });

  describe('detectOnInput', function () {
    it('should return true on a Youtube url', function () {
      assert.isTrue(youtube.detectOnInput('https://youtube.com/watch?v=TAryFIuRxmQ'));
      assert.isTrue(youtube.detectOnInput('https://www.youtube.com/watch?v=TAryFIuRxmQ'));
      assert.isTrue(youtube.detectOnInput('http://www.youtube.com/watch?v=TAryFIuRxmQ'));
    });
    it('should return false if no protocol (e.g. `http`)', function () {
      assert.isFalse(youtube.detectOnInput('www.youtube.com/watch?v=TAryFIuRxmQ'));
    });
    it('should return false for any other url', function () {
      assert.isFalse(youtube.detectOnInput('http://youtu.be?v=yusayd7'));
      assert.isFalse(youtube.detectOnInput('http://soundcloud.com?v=yusayd7'));
    });
  });

  describe('resolve', function () {
    it('should return a promise which resolves to a Youtube Track', function () {
      assert.eventually.typeOf(youtube.resolve('http://youtube.com/tender-games/tender-games-in-her-bed-feat-miss-natnat'), youtube.Track);
    });
    it('should return a promise which is rejected when not a track', function () {
      assert.isRejected(youtube.resolve('https://youtube.com/mixmag-1/sets/premiere-roots-panorama-mars-ep'));
      assert.isRejected(youtube.resolve('https://youtube.com'));
    });
  });
});
