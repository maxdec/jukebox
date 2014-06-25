'use strict';

var tracklist = require('./tracklist');
var resolver = require('./resolver');
var wManager = require('./worker_manager');
var socket = require('./socket')();
var redis = require('redis').createClient();
var crypto = require('crypto');
var minVotes = 3;

module.exports = function (app) {
  app.get('/player', function (req, res) {
    res.send(wManager.state());
  });

  app.post('/player', function (req, res) {
    if (!wManager.state().playing) wManager.start();
    res.send(201);
  });

  app.delete('/player', function (req, res) {
    if (wManager.state().playing) wManager.stop();
    res.send(201);
  });

  app.get('/tracks', function (req, res) {
    tracklist.get()
    .then(function (list) {
      res.send(list);
    }, function (err) {
      res.send(503, err.message);
    });
  });

  app.post('/tracks', function (req, res) {
    if (!req.body.url) return res.send(400, 'You need to provide a track URL.');
    resolver.resolve(req.body.url)
    .then(tracklist.add)
    .then(function (track) {
      socket.emit('new track', track);
      res.send(201, track);
    }, function (err) {
      res.send(500, err.message);
    });
  });

  app.get('/tracks/current', function (req, res) {
    tracklist.current()
    .then(function (track) {
      res.send(track);
    }, function (err) {
      res.send(500, err.message);
    });
  });

  app.post('/tracks/next', function (req, res) {
    tracklist.next()
    .then(function (track) {
      wManager.stop();
      wManager.start();
      res.send(track);
    }, function (err) {
      res.send(500, err.message);
    });
  });

  app.get('/tracks/history', function (req, res) {
    tracklist.history()
    .then(function (list) {
      res.send(list);
    }, function (err) {
      res.send(500, err.message);
    });
  });

  app.get('/votes', function (req, res) {
    redis.scard('jukebox:votes', function (err, count) {
      if (err) return res.send(500, err);
      res.send({
        favorable: count,
        total: minVotes
      });
    });
  });

  app.post('/votes', function (req, res) {
    var ua = req.headers['user-agent'];
    var hash = crypto.createHash('md5').update(ua).digest('hex');
    redis.sadd('jukebox:votes', hash, function (err, newCount) {
      if (err) return res.send(500, err);
      res.send(201);
      if (newCount > 0) {
        socket.emit('new vote', newCount);
        wManager.checkVotesNext();
      }
    });
  });
};
