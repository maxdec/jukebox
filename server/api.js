'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var morganLog = require('morgan');
var favicon = require('serve-favicon');

var trackBuilder = require('./track_builder');
var playerState = require('./player_state');
var logger = require('./logger');
var uniqueVisitor = require('./unique_visitor');
// Events Socket.io
require('./socket_events');

var nextTrack = require('./next');
var tracklist = require('./services/tracklist');
var listeners = require('./services/listeners');
var votes = require('./services/votes');
var current = require('./services/current');
var history = require('./services/history');

module.exports = function (app, playerManager) {
  playerManager.stream.on('data', _sendChunk);

  app.use(express.static(__dirname + '/../public'));
  app.use(morganLog('dev'));
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.use(cookieParser('lagavulin'));
  app.use(uniqueVisitor);
  app.set('views', __dirname + '/../public');
  app.set('view engine', 'ejs');
  app.engine('html', require('ejs').renderFile);
  app.use(favicon(__dirname + '/../public/jukebox.png'));

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
  function _allowCrossDomain(req, res, next) {
    if (allowedHosts.indexOf(req.headers.origin) !== -1) {
      res.header('Access-Control-Allow-Origin', req.headers.origin);
      res.header('Access-Control-Allow-Methods', allowedMethods);
      res.header('Access-Control-Allow-Headers', allowedHeaders);
      if ('OPTIONS' === req.method) return res.sendStatus(200);
    }
    next();
  }

  app.route('/player')
  .get(function (req, res) {
    res.send(playerState);
  })
  .post(function (req, res) {
    if (!playerState.playing) playerManager.start();
    res.sendStatus(201);
  })
  .delete(function (req, res) {
    if (playerState.playing) playerManager.stop();
    res.sendStatus(201);
  });

  app.route('/tracks')
  .options(_allowCrossDomain)
  .get(function (req, res) {
    tracklist.find({}, function (err, tracks) {
      if (err) return res.status(503).send(err.message);
      res.send(tracks);
    });
  })
  .post(_allowCrossDomain, function (req, res) {
    if (!req.body.url) return res.status(400).send('You need to provide a track URL.');
    trackBuilder.fromString(req.body.url)
    .then(function (track) {
      tracklist.create(track, function (err) {
        if (err) return res.status(500).send(err.message);
        res.status(201).send(track);
      });
    }, function (err) {
      res.status(500).send(err.message);
    });
  });

  app.route('/current')
  .get(function (req, res) {
    current.get(function (err, track) {
      if (err) return res.status(500).send(err);
      if (!track) return res.send({ votes: {}});

      votes.count(function (err, votesCount) {
        if (err) return logger.log(err);
        listeners.count(function (err, listenersCount) {
          if (err) return logger.log(err);
          track.votes = {
            favorable: votesCount,
            total: Math.round(listenersCount / 2)
          };
          res.send(track);
        });
      });
    });
  })
  .post(function (req, res) {
    var identifier = req.cookies.uid || req.ip; // shouldn't be `req.ip` but...
    votes.create(identifier, function (err, newCount) {
      if (err) return res.status(500).send(err);
      res.sendStatus(201);
      if (newCount > 0) _checkVotesNext();
    });
  })
  .delete(function (req, res) {
    nextTrack(function (err) {
      if (err) return res.status(500).send(err);
      playerManager.stop();
      playerManager.start();
    });
  });

  app.get('/history', function (req, res) {
    history.find({}, function (err, tracks) {
      if (err) return res.status(500).send(err.message);
      res.send(tracks);
    });
  });

  app.get('/stream', function (req, res) {
    res.set({
      'Content-Type': 'audio/mpeg',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      'Expires': '-1',
      'Pragma': 'no-cache',
    });

    listeners.add(req.cookies.uid, res);

    function _onEnd() {
      listeners.remove(req.cookies.uid, res);
    }

    res.on('close', _onEnd);
    res.on('finish', _onEnd);
  });

  /**
  * Check whether we need to skip the track.
  */
  function _checkVotesNext(callback) {
    votes.count(function (err, votesCount) {
      if (err) return callback(err);
      listeners.count(function (err, listenersCount) {
        if (err) return callback(err);
        if (votesCount < Math.round(listenersCount / 2)) return;
        nextTrack(function (err) {
          if (err) return callback(err);
          playerManager.stop();
          playerManager.start();
        });
      });
    });
  }
};


// Listeners are 'res' objects
function _sendChunk(chunk) {
  listeners.getAllSync().forEach(function (listener) {
    listener.write(chunk);
  });
}
