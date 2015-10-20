import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import helpers from '../utils/helpers';

export default class Track extends Component {
  _openUrl = event => {
    event.preventDefault();
    helpers.openExt(this.props.track.url);
  }

  _addTrack = event => {
    event.preventDefault();
    event.stopPropagation();
    this.props.addTrack(this.props.track.url);
  }

  render() {
    const fields = this.props.fields || ['id', 'title', 'artist', 'duration', 'icon'];
    const track = this.props.track;

    const tds = fields.map((field, i) => {
      let content;
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
        const iconClasses = classNames({
          'fa': true,
          'fa-fw': true,
          'fa-soundcloud': track.platform === 'soundcloud',
          'fa-youtuve-play': track.platform === 'youtube',
          'fa-upload': track.platform === 'file',
        });
        content = <i className={iconClasses}></i>;
      } else {
        content = track[field];
      }

      return <td key={i}>{content}</td>;
    });

    return (
      <tr onClick={this._openUrl}>
        {tds}
      </tr>
    );
  }
}

Track.propTypes = {
  track: PropTypes.object.isRequired,
  addTrack: PropTypes.func.isRequired
};
