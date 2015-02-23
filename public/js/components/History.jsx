'use strict';

var React = require('react/addons');
var Track = require('./Track.jsx');
var HistoryActions = require('../actions/HistoryActions');
var HistoryStore = require('../stores/HistoryStore');

module.exports = React.createClass({
  getInitialState: function () {
    return {
      tracks: HistoryStore.get()
    };
  },
  componentDidMount: function () {
    HistoryStore.addChangeListener(this._onHistoryChange);
    HistoryActions.fetch();
  },
  componentWillUnmount: function() {
    HistoryStore.removeChangeListener(this._onHistoryChange);
  },
  _onHistoryChange: function () {
    this.setState({ tracks: HistoryStore.get() });
  },
  render: function () {
    var rows = this.state.tracks.map(function (track, i) {
      track.id = i + 1;
      return <Track key={i} track={track} fields={['playedAt', 'title', 'artist', 'duration', 'again', 'icon']} />;
    }.bind(this));

    return (
      <div className="row tracklist">
        <div className="col-md-8 col-md-offset-2">
          <h3><i className="fa fa-music"></i> History</h3>
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Played at</th>
                <th>Title</th>
                <th>Artist</th>
                <th>Duration</th>
                <th>Again</th>
                <th><i className="fa fa-fw"></i></th>
              </tr>
            </thead>
            <tbody>
              {rows}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
});
