'use strict';
/* global socket */

var React = require('react/addons');
var Header = require('./Header.jsx');
var Footer = require('./Footer.jsx');
var Current = require('./Current.jsx');
var Tracklist = require('./Tracklist.jsx');
var History = require('./History.jsx');
var Settings = require('./Settings.jsx');

var CurrentActions = require('../actions/CurrentActions');
var CurrentStore = require('../stores/CurrentStore');
var SettingsStore = require('../stores/SettingsStore');
var notify = require('../utils/notify');

module.exports = React.createClass({
  getInitialState: function () {
    return {
      view: 'current',
      current: CurrentStore.get(),
    };
  },
  componentDidMount: function () {
    CurrentStore.addChangeListener(this._onCurrentChange);

    // Sockets listeners
    [
      'current:set',
      'current:removed',
      'current:position',
      'listeners:created',
      'listeners:removed',
      'votes:created',
      'votes:removed',
    ].forEach(function (eventName) {
      socket.on(eventName, this._onSocketMessage(eventName));
    }.bind(this));

    // Fetch init data
    CurrentActions.fetch();
  },
  componentWillUnmount: function() {
    CurrentStore.removeChangeListener(this._onCurrentChange);
  },
  _onCurrentChange: function () {
    this.setState({ current: CurrentStore.get() });
  },
  _onSocketMessage: function (eventName) {
    var update = React.addons.update;

    switch (eventName) {
      case 'current:set':
        return function (track) {
          console.log(track.title);
          if (SettingsStore.get('notify')) notify('New track playing', track.title);
          CurrentActions.set(track);
        }.bind(this);

      case 'current:removed':
        return function () {
          CurrentActions.set({});
        }.bind(this);

      case 'current:position':
        return function (perc) {
          CurrentActions.progress(perc);
        }.bind(this);

      case 'listeners:created':
        return function (count) {
          var current = CurrentStore.get();
          var newCurrent = update(current, { votes: { total: { $apply: function (x) { return x + count; }}}});
          CurrentActions.set(newCurrent);
        }.bind(this);

      case 'listeners:removed':
        return function (count) {
          var current = CurrentStore.get();
          var newCurrent = update(current, { votes: { total: { $apply: function (x) { return x - count; }}}});
          CurrentActions.set(newCurrent);
        }.bind(this);

      case 'votes:created':
        return function (count) {
          if (SettingsStore.get('notify')) notify('New vote for next track');
          var current = CurrentStore.get();
          var newCurrent = update(current, { votes: { favorable: { $apply: function (x) { return x + count; }}}});
          CurrentActions.set(newCurrent);
        }.bind(this);

      case 'votes:removed':
        return function (count) {
          var current = CurrentStore.get();
          var newCurrent = update(current, { votes: { favorable: { $apply: function (x) { return x - count; }}}});
          CurrentActions.set(newCurrent);
        }.bind(this);
    }
  },
  _submitVote: function () {
    CurrentActions.voteNext();
  },
  _navigate: function (view) {
    if (view in { current: 1, history: 1, settings: 1 }) {
      this.setState({ view: view });
    }
  },
  render: function () {
    var mainView;
    if (this.state.view === 'current') {
      mainView = <div>
        <Current track={this.state.current} onVote={this._submitVote} />
        <Tracklist />
      </div>;
    } else if (this.state.view === 'history') {
      mainView = <History />;
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
