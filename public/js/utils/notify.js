'use strict';
/* global Notification */

var notify = function (title, body) {
  if (Notification.permission === 'granted') {
    var n = new Notification(title, {
      body: body,
      icon: '/jukebox.png'
    });
    setTimeout(function close() {
      n.close();
    }, 3000);
  }
};
