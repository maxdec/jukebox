'use strict';
/* global api */
/* global Header */
/* global Footer */
/* global Current */
/* global Tracklist */
/* global History */

var View = React.createClass({
  getInitialState: function () {
    return {
      view: 'current',
      currentTrack: {},
      tracklist: [],
      history: []
    };
  },
  componentDidMount: function () {
    api.current.get(function (err, currentTrack) {
      if (err) return console.error(err);
      this.setState({ currentTrack: currentTrack });
    }.bind(this));

    api.tracks.get(function (err, tracks) {
      if (err) return console.error(err);
      this.setState({ tracklist: tracks });
    }.bind(this));

    api.history.get(function (err, tracks) {
      if (err) return console.error(err);
      this.setState({ history: tracks });
    }.bind(this));
  },
  submitVote: function () {
    var votes = this.state.votes.favorable;
    votes++;
    this.setState({ votes: { favorable: votes }});
  },
  submitTrack: function (trackUrl) {
    api.tracks.post({ url: trackUrl }, function (err, track) {
      if (err) return console.error(err);
      var tracks = this.state.tracklist;
      tracks.push(track);
      this.setState({ tracklist: tracks });
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
