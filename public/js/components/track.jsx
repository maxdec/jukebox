'use strict';
/* global helpers */

var Track = React.createClass({
  openUrl: function (event) {
    event.preventDefault();
    helpers.openExt(this.props.track.url);
  },
  addTrack: function (event) {
    event.preventDefault();
    // TODO
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
        content = <a href onClick={this.addTrack}><i className="fa fa-fw fa-reply fa-flip-vertical"></i></a>;
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
