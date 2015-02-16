'use strict';
/* global socket */

var Header = require('./Header.jsx');
var Footer = require('./Footer.jsx');
var Current = require('./Current.jsx');
var Tracklist = require('./Tracklist.jsx');
var History = require('./History.jsx');
var Settings = require('./Settings.jsx');

var CurrentActions = require('../actions/CurrentActions');
var HistoryActions = require('../actions/HistoryActions');
var TracklistActions = require('../actions/TracklistActions');
var CurrentStore = require('../stores/CurrentStore');
var HistoryStore = require('../stores/HistoryStore');
var SettingsStore = require('../stores/SettingsStore');
var TracklistStore = require('../stores/TracklistStore');
var notify = require('../utils/notify');

module.exports = React.createClass({
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
    if (SettingsStore.get('notify')) notify('New track playing');
    CurrentActions.fetch();
    TracklistActions.fetch();
    HistoryActions.fetch();
  },
  _newTrackAdded: function () {
    if (SettingsStore.get('notify')) notify('New track added to the tracklist');
    TracklistActions.fetch();
  },
  _newVotesNext: function () {
    if (SettingsStore.get('notify')) notify('New vote for next track');
    CurrentActions.fetch();
  },
  _submitVote: function () {
    CurrentActions.voteNext();
  },
  _submitTrack: function (trackUrl) {
    TracklistActions.add(trackUrl);
  },
  _navigate: function (view) {
    if (view in { current: 1, history: 1, settings: 1 }) {
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
    } else if (this.state.view === 'settings') {
      mainView = <Settings />;
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
