'use strict';

var tracklist = require('./tracklist');
var resolver = require('./resolver');
var wManager = require('./worker_manager');
var socket = require('./socket')();
var redis = require('redis').createClient();
var volume = require('./volume');
var minVotes = 3;

var allowedMethods = 'GET,PUT,POST,DELETE,OPTIONS';
var allowedHeaders = 'Content-Length,Content-Type';
function allowCrossDomain(req, res, next) {
  var allowedHosts = [
    'http://soundcloud.com',
    'https://soundcloud.com',
    'http://youtube.com',
    'https://youtube.com',
    'http://www.youtube.com',
    'https://www.youtube.com'
  ];

  if (allowedHosts.indexOf(req.headers.origin) !== -1) {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', allowedMethods);
    res.header('Access-Control-Allow-Headers', allowedHeaders);
    if ('OPTIONS' === req.method) return res.send(200);
  }
  next();
}

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

  app.options('/tracks', allowCrossDomain);

  app.post('/tracks', allowCrossDomain, function (req, res) {
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
    wManager.stop();
    tracklist.next().then(function () {
      wManager.start();
    });
    res.send(201);
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
    redis.sadd('jukebox:votes', req.ip, function (err, newCount) {
      if (err) return res.send(500, err);
      res.send(201);
      if (newCount > 0) {
        socket.emit('new vote', newCount);
        wManager.checkVotesNext();
      }
    });
  });

  app.get('/volume', function (req, res) {
    volume.get(function (err, perc) {
      if (err) return res.send(500, err);
      res.send(200, {
        perc: perc
      });
    });
  });

  app.post('/volume', function (req, res) {
    if (!req.body.perc) return res.send(400, 'You need to provide a percentage.');
    var p = parseInt(req.body.perc, 10);
    if (p < 0 || p > 100) return res.send(400, 'Percentage value out of range.');
    volume.set(p);
    res.send(201);
  });
};
