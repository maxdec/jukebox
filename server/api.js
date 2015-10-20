import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import morganLog from 'morgan';
import favicon from 'serve-favicon';

import configureStore from '../common/stores/configureStore';
import App from '../common/components/App';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { Provider } from 'react-redux';

import trackBuilder from './track_builder';
import playerState from './player_state';
import logger from './logger';
import uniqueVisitor from './unique_visitor';
import * as playerManager from './player_manager';

// Events Socket.io
import './socket_events';

import nextTrack from './next';
import tracklist from './services/tracklist';
import listeners from './services/listeners';
import votes from './services/votes';
import current from './services/current';
import history from './services/history';

export default (app) => {
  playerManager.stream.on('data', _sendChunk);

  app.use(express.static(__dirname + '/../public'));
  app.use(morganLog('dev'));
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.use(cookieParser('lagavulin'));
  app.use(uniqueVisitor);
  app.use(favicon(__dirname + '/../public/jukebox.png'));

  const allowedMethods = 'GET,PUT,POST,DELETE,OPTIONS';
  const allowedHeaders = 'Content-Length,Content-Type';
  const allowedHosts = [
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

  // app.route('/')
  // .get((req, res) => {
  //   // Compile an initial state
  //   const initialState = {
  //     current: {},
  //     history: [],
  //     player: {},
  //     settings: {},
  //     tracklist: [],
  //     votes: {}
  //   };

  //   // Create a new Redux store instance
  //   const store = configureStore(initialState);

  //   // Render the component to a string
  //   const html = ReactDOMServer.renderToString(
  //     <Provider store={store}>
  //       <App/>
  //     </Provider>
  //   );

  //   // Grab the initial state from our Redux store
  //   const finalState = store.getState();

  //   // Send the rendered page back to the client
  //   res.send(_renderFullPage(html, finalState));
  // });

  app.route('/player')
  .get((req, res) => {
    res.send(playerState);
  })
  .post((req, res) => {
    if (!playerState.playing) playerManager.start();
    res.sendStatus(201);
  })
  .delete((req, res) => {
    if (playerState.playing) playerManager.stop();
    res.sendStatus(201);
  });

  app.route('/tracks')
  .options(_allowCrossDomain)
  .get((req, res) => {
    tracklist.find({}, (err, tracks) => {
      if (err) return res.status(503).send(err.message);
      res.send(tracks);
    });
  })
  .post(_allowCrossDomain, (req, res) => {
    if (!req.body.url) return res.status(400).send('You need to provide a track URL.');
    trackBuilder.fromString(req.body.url)
    .then(trackOrTracks => {
      res.status(201).send(trackOrTracks);

      if (Array.isArray(trackOrTracks)) {
        trackOrTracks.forEach(track => {
          tracklist.create(track);
        });
      } else {
        tracklist.create(trackOrTracks);
      }
    }, err => {
      res.status(500).send(err.message);
    });
  });

  app.route('/current')
  .get((req, res) => {
    current.get((err, track) => {
      if (err) return res.status(500).send(err);
      if (!track) return res.send({});
      res.send(track);
    });
  })
  .delete((req, res) => {
    nextTrack(err => {
      if (err) return res.status(500).send(err);
      playerManager.stop();
      playerManager.start();
    });
  });

  app.route('/votes')
  .get((req, res) => {
    votes.count((err, votesCount) => {
      if (err) return logger.log(err);
      listeners.count((err, listenersCount) => {
        if (err) return logger.log(err);
        res.send({
          favorable: votesCount,
          total: Math.round(listenersCount / 2)
        });
      });
    });
  })
  .post((req, res) => {
    const identifier = req.cookies.uid || req.ip; // shouldn't be `req.ip` but...
    votes.create(identifier, (err, newCount) => {
      if (err) return res.status(500).send(err);
      res.sendStatus(201);
      if (newCount > 0) _checkVotesNext();
    });
  });

  app.get('/history', (req, res) => {
    history.find({}, (err, tracks) => {
      if (err) return res.status(500).send(err.message);
      res.send(tracks);
    });
  });

  app.get('/stream', (req, res) => {
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
    votes.count((err, votesCount) => {
      if (err) return callback(err);
      listeners.count((err, listenersCount) => {
        if (err) return callback(err);
        if (votesCount < Math.round(listenersCount / 2)) return;
        nextTrack(err => {
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
  listeners.getAllSync().forEach(listener => {
    listener.write(chunk);
  });
}

function _renderFullPage(html, initialState) {
  return `
    <!doctype html>
    <html>
      <head>
        <title>Redux Universal Example</title>
      </head>
      <body>
        <div id="app">${html}</div>
        <script>
          window.__INITIAL_STATE__ = ${JSON.stringify(initialState)};
        </script>
        <script src="/static/bundle.js"></script>
      </body>
    </html>
    `;
}
