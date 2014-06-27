javascript:(function(){
  var href = window.location.href;
  if (href.indexOf('soundcloud') === -1 && href.indexOf('youtube') === -1) { return; }
  var request = new XMLHttpRequest();
  var params = JSON.stringify({ url: href });
  request.open('POST', 'http://192.168.1.180:3000/tracks', true);
  request.setRequestHeader('Content-Type', 'application/json');
  request.send(params);
})();
