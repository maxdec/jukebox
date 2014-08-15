javascript:(function(){
  var href = window.location.href;
  if (href.indexOf('soundcloud') === -1 && href.indexOf('youtube') === -1) { return; }
  var request = new XMLHttpRequest();
  var params = JSON.stringify({ url: href });
  request.open('POST', 'http://192.168.1.180:3000/tracks', true);
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
})();
