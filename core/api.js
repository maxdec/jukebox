'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var logger = require('morgan');
var favicon = require('serve-favicon');

var tracklist = require('./tracklist');
var redis = require('redis').createClient();
var volume = require('./volume');
var config = require('./config');
var trackBuilder = require('./track_builder');
var socket = require('./socket')();
var playerState = require('./player_state');
module.exports = function (app, playerManager) {

app.use(express.static(__dirname + '/../web-ui'));
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('views', __dirname + '/../web-ui');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(favicon(__dirname + '/../web-ui/jukebox.png'));

var allowedMethods = 'GET,PUT,POST,DELETE,OPTIONS';
var allowedHeaders = 'Content-Length,Content-Type';
var allowedHosts = [
  'http://soundcloud.com',
  'https://soundcloud.com',
  'http://youtube.com',
  'https://youtube.com',
  'http://www.youtube.com',
  'https://www.youtube.com'
];
function allowCrossDomain(req, res, next) {
  if (allowedHosts.indexOf(req.headers.origin) !== -1) {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', allowedMethods);
    res.header('Access-Control-Allow-Headers', allowedHeaders);
    if ('OPTIONS' === req.method) return res.status(200).end();
  }
  next();
}

  app.get('/player', function (req, res) {
    res.send(playerState);
  });

  app.post('/player', function (req, res) {
    if (!playerState.playing) playerManager.start();
    res.status(201).end();
  });

  app.delete('/player', function (req, res) {
    if (playerState.playing) playerManager.stop();
    res.status(201).end();
  });

  app.get('/tracks', function (req, res) {
    tracklist.get()
    .then(function (list) {
      res.send(list);
    }, function (err) {
      res.status(503).send(err.message);
    });
  });

  app.options('/tracks', allowCrossDomain);

  app.post('/tracks', allowCrossDomain, function (req, res) {
    if (!req.body.url) return res.status(400).send('You need to provide a track URL.');
    trackBuilder.fromString(req.body.url)
    .then(tracklist.add)
    .then(function (track) {
      socket.emit('new track', track);
      res.status(201).send(track);
    }, function (err) {
      res.status(500).send(err.message);
    });
  });

  app.get('/tracks/current', function (req, res) {
    tracklist.current()
    .then(function (track) {
      res.send(track);
    }, function (err) {
      res.status(500).send(err.message);
    });
  });

  app.post('/tracks/next', function (req, res) {
    playerManager.stop();
    tracklist.next().then(function () {
      playerManager.start();
    });
    res.status(201).end();
  });

  app.get('/tracks/history', function (req, res) {
    tracklist.history()
    .then(function (list) {
      res.send(list);
    }, function (err) {
      res.status(500).send(err.message);
    });
  });

  app.get('/votes', function (req, res) {
    redis.scard('jukebox:votes', function (err, count) {
      if (err) return res.status(500).send(err);
      res.send({
        favorable: count,
        total: config.minVotes
      });
    });
  });

  app.post('/votes', function (req, res) {
    redis.sadd('jukebox:votes', req.ip, function (err, newCount) {
      if (err) return res.status(500).send(err);
      res.send(201).end();
      if (newCount > 0) {
        socket.emit('new vote', newCount);
        checkVotesNext();
      }
    });
  });

  app.get('/volume', function (req, res) {
    volume.get(function (err, perc) {
      if (err) return res.status(500).send(err);
      res.status(200).send({ perc: perc });
    });
  });

  app.post('/volume', function (req, res) {
    if (!req.body.perc) return res.status(400).send('You need to provide a percentage.');
    var p = parseInt(req.body.perc, 10);
    if (p < 0 || p > 100) return res.status(400).send('Percentage value out of range.');
    volume.set(p);
    res.status(201).end();
  });

  /**
  * Check whether we need to skip the track.
  */
  function checkVotesNext() {
    redis.scard('jukebox:votes', function (err, count) {
      if (err) return console.log(err);
      if (count < config.minVotes) return;
      tracklist.next();
      playerManager.stop();
      playerManager.start();
    });
  }
};
