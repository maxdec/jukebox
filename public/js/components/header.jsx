'use strict';
/* global PlayerActions */
/* global PlayerStore */
/* global Slider */

var Header = React.createClass({
  componentDidMount: function () {
    PlayerStore.addChangeListener(this._onPlayerChange);
    PlayerActions.reset('/stream');
  },
  componentWillUnmount: function () {
    PlayerStore.removeChangeListener(this._onPlayerChange);
  },
  _onPlayerChange: function () {
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
    event.preventDefault();
    this.props.onNavigate(view);
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
            <li className={cx({ active: this.props.view === 'current' })}><a href onClick={this._navigate.bind(null, 'current')}>Playing</a></li>
            <li className={cx({ active: this.props.view === 'history' })}><a href onClick={this._navigate.bind(null, 'history')}>History</a></li>
          </ul>
          <h3 className="masthead-brand">Jukebox</h3>
          <h3 className="fa fa-music"></h3>
        </div>
      </div>
    );
  }
});
