'use strict';
/* global Header */
/* global Footer */
/* global Current */
/* global Tracklist */
/* global History */
/* global socket */
/* global CurrentActions */
/* global CurrentStore */
/* global HistoryActions */
/* global HistoryStore */
/* global TracklistActions */
/* global TracklistStore */
/* global notify */

var App = React.createClass({
  getInitialState: function () {
    return { view: 'current' };
  },
  componentDidMount: function () {
    // Stores listeners
    CurrentStore.addChangeListener(this._onChange);
    TracklistStore.addChangeListener(this._onChange);
    HistoryStore.addChangeListener(this._onChange);
    // Sockets listeners
    socket.on('current:progress', this._trackProgress);
    socket.on('current:new', this._newTrackPlaying);
    socket.on('current:votes', this._newVotesNext);
    socket.on('tracks:new', this._newTrackAdded);
    // Fetch init data
    CurrentActions.fetch();
    TracklistActions.fetch();
    HistoryActions.fetch();
  },
  componentWillUnmount: function() {
    CurrentStore.removeChangeListener(this._onChange);
    TracklistStore.removeChangeListener(this._onChange);
    HistoryStore.removeChangeListener(this._onChange);
  },
  _onChange: function () {
    this.forceUpdate();
  },
  _trackProgress: function (perc) {
    CurrentActions.progress(perc);
  },
  _newTrackPlaying: function () {
    notify('New track playing');
    CurrentActions.fetch();
    TracklistActions.fetch();
    HistoryActions.fetch();
  },
  _newTrackAdded: function () {
    notify('New track added to the tracklist');
    TracklistActions.fetch();
  },
  _newVotesNext: function () {
    notify('New vote for next track');
    CurrentActions.fetch();
  },
  _submitVote: function () {
    CurrentActions.voteNext();
  },
  _submitTrack: function (trackUrl) {
    TracklistActions.add(trackUrl);
  },
  _navigate: function (view) {
    if (view in { current: 1, history: 1 }) {
      this.setState({ view: view });
    }
  },
  render: function () {
    var current = CurrentStore.get();
    var tracklist = TracklistStore.get();
    var history = HistoryStore.get();

    var mainView;
    if (this.state.view === 'current') {
      mainView = <div>
        <Current track={current} onVote={this._submitVote} />
        <Tracklist tracks={tracklist} onTrackSubmit={this._submitTrack} />
      </div>;
    } else if (this.state.view === 'history') {
      mainView = <History tracks={history} onTrackSubmit={this._submitTrack} />;
    }

    return (
      <div className="container">
        <Header onNavigate={this._navigate} view={this.state.view} />
        {mainView}
        <Footer />
      </div>
    );
  }
});
