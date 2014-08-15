'use strict';

var express = require('express');
var app = express();
var http = require('http').Server(app);
var config = require('./core/config');
require('./core/socket')(http);
var playerManager = require('./core/player_manager');

require('./core/api')(app, playerManager);

http.listen(config.port, function () {
  console.log('✔ App listening on port', config.port);
});
