'use strict';
/* global Player */
/* global Slider */

var Header = React.createClass({
  getInitialState: function () {
    return { player: new Player('/stream') };
  },
  componentDidMount: function () {
    this.play();
  },
  setVolume: function (perc) {
    var player = this.state.player;
    player.volume(perc);
    this.setState({ player: player });
  },
  play: function () {
    event.preventDefault();
    var player = this.state.player;
    player.play();
    this.setState({ player: player });
  },
  pause: function () {
    event.preventDefault();
    var player = this.state.player;
    player.pause();
    this.setState({ player: player });
  },
  navigate: function (view) {
    event.preventDefault();
    this.props.onNavigate(view);
  },
  render: function () {
    var cx = React.addons.classSet;
    var playBtn;
    if (this.state.player.playing) {
      playBtn = <a href onClick={this.pause}><i className="fa fa-pause"></i></a>;
    } else {
      playBtn = <a href onClick={this.play}><i className="fa fa-play"></i></a>;
    }

    return (
      <div className="row masthead">
        <div className="col-xs-12">
          <ul className="nav masthead-nav pull-right">
            <li className="volume">
              <i className="fa fa-volume-up"></i>
              <Slider perc={this.state.player.volume()} onChange={this.setVolume} />
            </li>
            <li>{playBtn}</li>
            <li className={cx({ active: this.props.view === 'current' })}><a href onClick={this.navigate.bind(null, 'current')}>Playing</a></li>
            <li className={cx({ active: this.props.view === 'history' })}><a href onClick={this.navigate.bind(null, 'history')}>History</a></li>
          </ul>
          <h3 className="masthead-brand">Jukebox</h3>
          <h3 className="fa fa-music"></h3>
        </div>
      </div>
    );
  }
});
