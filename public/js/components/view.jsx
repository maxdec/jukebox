'use strict';
/* global api */
/* global Header */
/* global Footer */
/* global Current */
/* global Tracklist */
/* global History */
/* global socket */

var View = React.createClass({
  getInitialState: function () {
    socket.on('current:progress', this.trackProgress);
    socket.on('current:new', this.newTrackPlaying);
    socket.on('current:votes', this.votesNextUpdated);
    socket.on('tracks:new', this.newTrackAdded);

    return {
      view: 'current',
      currentTrack: {},
      tracklist: [],
      history: []
    };
  },
  componentDidMount: function () {
    this.getCurrentTrack();
    this.getTracklist();
    this.getHistory();
  },
  getCurrentTrack: function () {
    api.current.get(function (err, currentTrack) {
      if (err) return console.error(err);
      this.setState({ currentTrack: currentTrack });
    }.bind(this));
  },
  getTracklist: function () {
    api.tracks.get(function (err, tracks) {
      if (err) return console.error(err);
      this.setState({ tracklist: tracks });
    }.bind(this));
  },
  getHistory: function () {
    api.history.get(function (err, tracks) {
      if (err) return console.error(err);
      this.setState({ history: tracks });
    }.bind(this));
  },
  trackProgress: function (perc) {
    var current = this.state.currentTrack;
    current.progress = perc;
    this.setState({ currentTrack: current });
  },
  newTrackPlaying: function (track) {
    var tracklist = this.state.tracklist;
    tracklist.shift();
    this.setState({ currentTrack: track, tracklist: tracklist });
    this.getTracklist();
    this.getHistory();
  },
  newTrackAdded: function (track) {
    var tracklist = this.state.tracklist;
    tracklist.push(track);
    this.setState({ tracklist: tracklist });
  },
  votesNextUpdated: function (votes) {
    var current = this.state.currentTrack;
    current.votes.favorable = votes;
    this.setState({ currentTrack: current });
  },
  submitVote: function () {
    var votes = this.state.votes.favorable;
    votes++;
    this.setState({ votes: { favorable: votes }});
  },
  submitTrack: function (trackUrl) {
    api.tracks.post({ url: trackUrl }, function (err, track) {
      if (err) return console.error(err);
    }.bind(this));
  },
  navigate: function (view) {
    if (view in { current: 1, history: 1 }) {
      this.setState({ view: view });
    }
  },
  render: function () {
    var mainView;
    if (this.state.view === 'current') {
      mainView = <div>
        <Current track={this.state.currentTrack} onVote={this.submitVote} />
        <Tracklist tracks={this.state.tracklist} onTrackSubmit={this.submitTrack} />
      </div>;
    } else if (this.state.view === 'history') {
      mainView = <History tracks={this.state.history} onTrackSubmit={this.submitTrack} />;
    }

    return (
      <div className="container">
        <Header onNavigate={this.navigate} view={this.state.view} />
        {mainView}
        <Footer />
      </div>
    );
  }
});
