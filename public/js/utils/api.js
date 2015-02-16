'use strict';

var api = {
  req: function (method, url, data, callback) {
    if (!callback) {
      callback = data;
      data = null;
    }

    $.ajax({
      url: url,
      dataType: 'json',
      data: data,
      type: method,
      success: function (data) {
        callback(null, data);
      },
      error: function (xhr, status, err) {
        callback(err);
      }
    });
  },
  player: {
    get: function (callback) {
      api.req('GET', '/player', callback);
    },
    post: function (callback) {
      api.req('POST', '/player', callback);
    },
    delete: function (callback) {
      api.req('DELETE', '/player', callback);
    }
  },
  tracks: {
    get: function (callback) {
      api.req('GET', '/tracks', callback);
    },
    post: function (track, callback) {
      api.req('POST', '/tracks', track, callback);
    }
  },
  current: {
    get: function (callback) {
      api.req('GET', '/current', callback);
    },
    post: function (callback) {
      api.req('POST', '/current', callback);
    },
    delete: function (callback) {
      api.req('DELETE', '/current', callback);
    }
  },
  history: {
    get: function (callback) {
      api.req('GET', '/history', callback);
    }
  }
};

module.exports = api;
