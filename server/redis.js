'use strict';

var redis = require('redis');

function _newRedisClient(port, server) {
  var client = redis.createClient(port, server);

  client.once('ready', function () {
    console.log('Redis is connected');
  });

  // client.on('error', function (err) {
  //   console.log('Redis error:', err);
  // });

  client.on('reconnecting', function () {
    console.log('Redis is reconnecting');
  });

  client.once('end', function () {
    console.log('Redis connection terminated');
  });

  return client;
}

module.exports = _newRedisClient();
