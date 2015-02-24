'use strict';

var React = require('react/addons');
var cx = React.addons.classSet;
var helpers = require('../utils/helpers');
var CurrentActions = require('../actions/CurrentActions');
var VotesActions = require('../actions/VotesActions');
var CurrentStore = require('../stores/CurrentStore');
var VotesStore = require('../stores/VotesStore');

module.exports = React.createClass({
  getInitialState: function () {
    return {
      track: CurrentStore.get(),
      votes: VotesStore.get()
    };
  },
  componentDidMount: function () {
    CurrentStore.addChangeListener(this._onCurrentChange);
    VotesStore.addChangeListener(this._onVotesChange);
    // Fetch init data
    CurrentActions.fetch();
    VotesActions.fetch();
  },
  componentWillUnmount: function() {
    CurrentStore.removeChangeListener(this._onCurrentChange);
    VotesStore.removeChangeListener(this._onVotesChange);
  },
  _onCurrentChange: function () {
    this.setState({ track: CurrentStore.get() });
  },
  _onVotesChange: function () {
    this.setState({ votes: VotesStore.get() });
  },
  _submitVote: function () {
    VotesActions.doVote();
  },
  render: function () {
    var iconClasses = cx({
      'fa': true,
      'fa-fw': true,
      'fa-2x': true,
      'fa-soundcloud': this.state.track.platform === 'soundcloud',
      'fa-youtube-play': this.state.track.platform === 'youtube'
    });

    var progress = { width: (this.state.track.progress || 0) + '%' };

    var content;
    if (this.state.track.title) {
      content = <div className="inner cover">
        <a href={this.state.track.url} target="_blank">
          <i className={iconClasses}></i>
          <img src={this.state.track.cover} alt="Cover" />
          <div className="progress">
            <div className="progress-bar progress-bar-danger" style={progress}></div>
          </div>
        </a>
        <h2 className="cover-heading">{this.state.track.title}</h2>
        <p className="lead">{this.state.track.artist} • {helpers.duration(this.state.track.duration)}</p>
        <p className="lead">
          <button className="btn btn-default" onClick={this._submitVote}>
            <i className="fa fa-fast-forward"></i> {this.state.votes.favorable}/{this.state.votes.total}
          </button>
        </p>
      </div>;
    } else {
      content = <div className="inner cover">
        <h1 className="cover-heading">Nothing playing...</h1>
      </div>;
    }

    return (
      <div className="row">
        <div className="col-xs-12">
          {content}
        </div>
      </div>
    );
  }
});
