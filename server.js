'use strict';

var express = require('express');
var app = express();
var http = require('http').Server(app);
var config = require('./server/config');
require('./server/socket')(http);
var playerManager = require('./server/player_manager');

require('./server/api')(app, playerManager);

http.listen(config.port, function () {
  console.log('✔ App listening on port', config.port);
});
