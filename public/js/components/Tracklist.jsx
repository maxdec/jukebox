'use strict';
/* global socket */

var React = require('react/addons');
var Track = require('./Track.jsx');
var TracklistActions = require('../actions/TracklistActions');
var SettingsStore = require('../stores/SettingsStore');
var TracklistStore = require('../stores/TracklistStore');
var notify = require('../utils/notify');

module.exports = React.createClass({
  getInitialState: function () {
    return {
      tracks: TracklistStore.get()
    };
  },
  componentDidMount: function () {
    TracklistStore.addChangeListener(this._onTracklistChange);
    socket.on('tracklist:created', this._onTracklistCreated);
    socket.on('tracklist:removed', this._onTracklistRemoved);
    // Fetch init data
    TracklistActions.fetch();
  },
  componentWillUnmount: function() {
    TracklistStore.removeChangeListener(this._onTracklistChange);
  },
  _onTracklistChange: function () {
    this.setState({ tracks: TracklistStore.get() });
  },
  _onTracklistCreated: function (track) {
    TracklistActions.add(track);
    if (SettingsStore.get('notify')) {
      notify('New track added to the tracklist', track.title);
    }
  },
  _addTrack: function (event) {
    event.preventDefault();
    var trackUrl = this.refs.trackUrl.getDOMNode().value.trim();
    if (!trackUrl) return;
    TracklistActions.addUrl(trackUrl);
    this.refs.trackUrl.getDOMNode().value = '';
  },
  render: function () {
    var rows = this.state.tracks.map(function (track, i) {
      track.id = i + 1;
      return <Track key={i} track={track} fields={['id', 'title', 'artist', 'duration', 'icon']} />;
    }.bind(this));

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
});
