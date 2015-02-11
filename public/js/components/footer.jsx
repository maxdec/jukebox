'use strict';

var Footer = React.createClass({
  render: function () {
    var bookmarklet = 'javascript:(function(){var e=window.location.href;if(e.indexOf(\'soundcloud\')===-1&&e.indexOf(\'youtube\')===-1){return}var t=new XMLHttpRequest;var n=JSON.stringify({url:e});t.open(\'POST\',\'http://' + location.host + '/tracks\',true);t.setRequestHeader(\'Content-Type\',\'application/json\');t.onload=function(){if(t.readyState===4){if(t.status===200||t.status===201)alert(\'Added!\');else alert(\'Error!\')}};t.onerror=function(){console.error(t.statusText)};t.send(n)})()';
    return (
      <div className="row">
        <div className="col-xs-12">
          <div className="mastfoot">
            <div className="inner">
              <p>Always have some music playing at <a href="https://spotistic.com">Spotistic</a>, by <a href="https://twitter.com/baptou12" target="_blank">@baptou12</a> & <a href="https://twitter.com/maxdec" target="_blank">@maxdec</a>.</p>
              <p>
                <a className="boxed" href={bookmarklet}>+ Add</a>
                Drag and drop this to your bookmarks to easily add new tracks.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
});
