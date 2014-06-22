'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var logger = require('morgan');
var favicon = require('serve-favicon');
var app = express();
var http = require('http').Server(app);
require('./socket')(http);

app.use(express.static(__dirname + '/public'));
app.use(logger('dev'));
app.use(bodyParser());
app.set('views', __dirname + '/public');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(favicon(__dirname + '/public/jukebox.png'));
require('./routes')(app);

http.listen(3000, function(){
  console.log('App listening on port 3000');
});
