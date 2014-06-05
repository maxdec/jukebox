'use strict';

var cp = require('child_process');
var express = require('express');
var bodyParser = require('body-parser');
var logger = require('morgan');
var favicon = require('serve-favicon');
var app = express();
var tracklist = require('./tracklist');

app.use(express.static(__dirname + '/public'));
app.use(logger('dev'));
app.use(bodyParser());
app.set('views', __dirname + '/public');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(favicon(__dirname + '/public/jukebox.png'));

app.route('/tracks')
.get(function (req, res) {
  tracklist.get()
  .then(function (list) {
    res.send(list);
  }, function (err) {
    res.send(503, err.message);
  });
})
.post(function (req, res) {
  if (!req.body.track) return res.send(400, 'You need to provide a track URL.');
  tracklist.add(req.body.track)
  .then(function () {
    res.send(201);
  }, function (err) {
    res.send(503, err.message);
  });
});

app.listen(3000);
console.log('App listening on port 3000');

// var worker = cp.fork('./worker');
// worker.on('exit', function () {
//   console.log('Worker died :(');
//   // Replace the dead worker
//   worker = cp.fork('./worker');
// });

// worker.on('message', function (m) {
//   console.log('PARENT', m);
// });
