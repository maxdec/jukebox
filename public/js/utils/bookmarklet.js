'use strict';
/* jslint scripturl:true */

module.exports = function () {
  return [
    'javascript:(',
    _addTrack.toString().replace('$JUKEBOX_URL$', window.location.host),
    ')()'
  ].join('');
};

function _addTrack() {
  var href = window.location.href;
  var protocol = window.location.protocol;
  if (href.indexOf('soundcloud') === -1 && href.indexOf('youtube') === -1) { return; }
  var request = new XMLHttpRequest();
  var params = JSON.stringify({ url: href });
  var url =
  request.open('POST', protocol + '//$JUKEBOX_URL$/tracks', true);
  request.setRequestHeader('Content-Type', 'application/json');
  request.onload = function () {
    if (request.readyState === 4) {
      if (request.status === 200 || request.status === 201) alert('Added!');
      else alert('Error!');
    }
  };
  request.onerror = function () {
    console.error(request.statusText);
  };
  request.send(params);
}
