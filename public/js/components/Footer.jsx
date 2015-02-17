'use strict';

var React = require('react/addons');
var bookmarklet = require('../utils/bookmarklet');

module.exports = React.createClass({
  render: function () {
    return (
      <div className="row">
        <div className="col-xs-12">
          <div className="mastfoot">
            <div className="inner">
              <p>Always have some music playing at <a href="https://spotistic.com">Spotistic</a>, by <a href="https://twitter.com/baptou12" target="_blank">@baptou12</a> & <a href="https://twitter.com/maxdec" target="_blank">@maxdec</a>.</p>
              <p>
                <a className="boxed" href={bookmarklet()}>+ Add</a>
                Drag and drop this to your bookmarks to easily add new tracks.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
});
