import React, { Component, PropTypes } from 'react';
import Track from './Track';

export default class Tracklist extends Component {
  _addTrack = event => {
    event.preventDefault();
    const trackUrl = this.refs.trackUrl.getDOMNode().value.trim();
    if (!trackUrl) return;
    this.props.addUrl(trackUrl);
    this.refs.trackUrl.getDOMNode().value = '';
  }

  render() {
    const rows = this.props.tracks.map((track, i) => {
      track.id = i + 1;
      return <Track key={i} track={track} fields={['id', 'title', 'artist', 'duration', 'icon']} addTrack={this.props.addTrack} />;
    });

    return (
      <div className="row tracklist">
        <div className="col-md-6 col-md-offset-3">
          <h3><i className="fa fa-music"></i> Tracklist</h3>
          <table className="table table-hover">
            <thead>
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>Artist</th>
                <th>Duration</th>
                <th><i className="fa fa-fw"></i></th>
              </tr>
            </thead>
            <tbody>
              {rows}
              <tr>
                <td colSpan="5">
                  <form onSubmit={this._addTrack}>
                    <div className="input-group">
                      <span className="input-group-addon"><i className="fa fa-plus"></i></span>
                      <input type="text" className="form-control" ref="trackUrl" placeholder="https://soundcloud.com/ghoststoriesmixtape/ghost-stories-ghostface" />
                    </div>
                  </form>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

Tracklist.propTypes = {
  tracks: PropTypes.array.isRequired,
  addUrl: PropTypes.func.isRequired,
  addTrack: PropTypes.func.isRequired,
};
