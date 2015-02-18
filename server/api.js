'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var morganLog = require('morgan');
var favicon = require('serve-favicon');

var tracklist = require('./tracklist');
var redis = require('redis').createClient();
var config = require('./config');
var trackBuilder = require('./track_builder');
var socket = require('./socket')();
var playerState = require('./player_state');
var listeners = [];
var logger = require('./logger');
var uniqueVisitor = require('./unique_visitor');

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
      if ('OPTIONS' === req.method) return res.status(200).end();
    }
    next();
  }

  app.route('/player')
  .get(function (req, res) {
    res.send(playerState);
  })
  .post(function (req, res) {
    if (!playerState.playing) playerManager.start();
    res.status(201).end();
  })
  .delete(function (req, res) {
    if (playerState.playing) playerManager.stop();
    res.status(201).end();
  });

  app.route('/tracks')
  .options(_allowCrossDomain)
  .get(function (req, res) {
    tracklist.get()
    .then(function (list) {
      res.send(list);
    }, function (err) {
      res.status(503).send(err.message);
    });
  })
  .post(_allowCrossDomain, function (req, res) {
    if (!req.body.url) return res.status(400).send('You need to provide a track URL.');
    trackBuilder.fromString(req.body.url)
    .then(tracklist.add)
    .then(function (track) {
      socket.emit('tracks:new');
      res.status(201).send(track);
    }, function (err) {
      res.status(500).send(err.message);
    });
  });

  app.route('/current')
  .get(function (req, res) {
    tracklist.current()
    .then(function (track) {
      if (!track) return res.send({});

      redis.scard('jukebox:votes', function (err, count) {
        if (err) return res.status(500).send(err);
        track.votes = {
          favorable: count,
          total: config.minVotes
        };
        res.send(track);
      });
    }, function (err) {
      res.status(500).send(err.message);
    });
  })
  .post(function (req, res) {
    var identifier = req.cookies.uid || req.ip; // shouldn't be `req.ip` but...
    redis.sadd('jukebox:votes', identifier, function (err, newCount) {
      if (err) return res.status(500).send(err);
      res.send(201).end();
      if (newCount > 0) {
        socket.emit('current:votes');
        _checkVotesNext();
      }
    });
  })
  .delete(function (req, res) {
    playerManager.stop();
    tracklist.next().then(function () {
      playerManager.start();
    });
    res.status(201).end();
  });

  app.get('/history', function (req, res) {
    tracklist.history()
    .then(function (list) {
      res.send(list);
    }, function (err) {
      res.status(500).send(err.message);
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

    _addListener(res);

    function _onEnd() {
      _removeListener(res);
    }

    res.on('close', _onEnd);
    res.on('finish', _onEnd);
  });

  /**
  * Check whether we need to skip the track.
  */
  function _checkVotesNext() {
    redis.scard('jukebox:votes', function (err, count) {
      if (err) return logger.log(err);
      if (count < config.minVotes) return;
      tracklist.next();
      playerManager.stop();
      playerManager.start();
    });
  }
};

function _addListener(res) {
  logger.log('Adding listener');
  listeners.push(res);
}

function _removeListener(res) {
  var idx = listeners.indexOf(res);
  listeners.splice(idx, 1);
  logger.log('Removed listener. ' + listeners.length + ' are left.');
}

// Listeners are 'res' objects
function _sendChunk(chunk) {
  listeners.forEach(function (listener) {
    listener.write(chunk);
  });
}
