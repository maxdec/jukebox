'use strict';

var React = require('react/addons');
var helpers = require('../utils/helpers');
var TracklistActions = require('../actions/TracklistActions');

module.exports = React.createClass({
  openUrl: function (event) {
    event.preventDefault();
    helpers.openExt(this.props.track.url);
  },
  _addTrack: function (event) {
    event.preventDefault();
    event.stopPropagation();
    TracklistActions.add(this.props.track.url);
  },
  render: function () {
    var cx = React.addons.classSet;
    var fields = this.props.fields || ['id', 'title', 'artist', 'duration', 'icon'];
    var track = this.props.track;

    var tds = fields.map(function (field, i) {
      var content;
      if (field === 'duration') {
        content = helpers.duration(track.duration);
      } else if (field === 'playedAt') {
        content = helpers.at(track.playedAt);
      } else if (field === 'again') {
        if (track.url) {
          content = <a href onClick={this._addTrack}><i className="fa fa-fw fa-reply fa-flip-vertical"></i></a>;
        } else {
          content = '';
        }
      } else if (field === 'icon') {
        var iconClasses = cx({
          'fa': true,
          'fa-fw': true,
          'fa-soundcloud': track.platform === 'soundcloud',
          'fa-youtube-play': track.platform === 'youtube',
          'fa-upload': track.platform === 'file',
        });
        content = <i className={iconClasses}></i>;
      } else {
        content = track[field];
      }

      return <td key={i}>{content}</td>;
    }.bind(this));

    return (
      <tr onClick={this.openUrl}>
        {tds}
      </tr>
    );
  }
});
