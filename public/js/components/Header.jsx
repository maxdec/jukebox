'use strict';

var React = require('react/addons');
var Slider = require('./Slider.jsx');
var PlayerActions = require('../actions/PlayerActions');
var SettingsActions = require('../actions/SettingsActions');
var PlayerStore = require('../stores/PlayerStore');
var SettingsStore = require('../stores/SettingsStore');

module.exports = React.createClass({
  componentDidMount: function () {
    PlayerStore.addChangeListener(this._onChange);
    PlayerActions.reset('/stream');
    if (SettingsStore.get('autoplay')) PlayerActions.play();
  },
  componentWillUnmount: function () {
    PlayerStore.removeChangeListener(this._onChange);
  },
  _onChange: function () {
    this.forceUpdate();
  },
  _setVolume: function (perc) {
    PlayerActions.volume(perc);
  },
  _play: function (event) {
    event.preventDefault();
    PlayerActions.play();
  },
  _pause: function (event) {
    event.preventDefault();
    PlayerActions.pause();
  },
  _navigate: function (view) {
    return function (event) {
      event.preventDefault();
      this.props.onNavigate(view);
    }.bind(this);
  },
  render: function () {
    var cx = React.addons.classSet;
    var volume = PlayerStore.getVolume();
    var playing = PlayerStore.isPlaying();
    var playBtn;
    if (playing) {
      playBtn = <a href onClick={this._pause}><i className="fa fa-pause"></i></a>;
    } else {
      playBtn = <a href onClick={this._play}><i className="fa fa-play"></i></a>;
    }

    return (
      <div className="row masthead">
        <div className="col-xs-12">
          <ul className="nav masthead-nav pull-right">
            <li className="volume">
              <i className="fa fa-volume-up"></i>
              <Slider perc={volume} onChange={this._setVolume} />
            </li>
            <li>{playBtn}</li>
            <li className={cx({ active: this.props.view === 'current' })}><a href onClick={this._navigate('current')}>Playing</a></li>
            <li className={cx({ active: this.props.view === 'history' })}><a href onClick={this._navigate('history')}>History</a></li>
            <li className={cx({ active: this.props.view === 'settings' })}><a href onClick={this._navigate('settings')}><i className="fa fa-cogs"></i></a></li>
          </ul>
          <h3 className="masthead-brand">Jukebox</h3>
          <h3 className="fa fa-music"></h3>
        </div>
      </div>
    );
  }
});
