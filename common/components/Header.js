import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { isActive } from 'redux-router';
import classNames from 'classnames';
import Slider from './Slider';
export default class Header extends Component {
  _setVolume = perc => {
    this.props.actions.volume(perc);
  }

  _play = event => {
    event.preventDefault();
    this.props.actions.play();
  }

  _stop = event => {
    event.preventDefault();
    this.props.actions.stop();
  }

  render() {
    let playBtn;
    if (this.props.player.playing) {
      playBtn = <a href onClick={this._stop}><i className="fa fa-stop"></i></a>;
    } else {
      playBtn = <a href onClick={this._play}><i className="fa fa-play"></i></a>;
    }

    return (
      <div className="row masthead">
        <div className="col-xs-12">
          <ul className="nav masthead-nav pull-right">
            <li className="volume">
              <i className="fa fa-volume-up"></i>
              <Slider perc={this.props.player.volume} onChange={this._setVolume} />
            </li>
            <li>{playBtn}</li>
            <li className={classNames({ active: isActive('/') })}><Link to="/">Playing</Link></li>
            <li className={classNames({ active: isActive('/history') })}><Link to="/history">History</Link></li>
            <li className={classNames({ active: isActive('/settings') })}><Link to="/settings"><i className="fa fa-cogs"></i></Link></li>
          </ul>
          <h3 className="masthead-brand">Jukebox</h3>
          <h3 className="fa fa-music"></h3>
        </div>
      </div>
    );
  }
}

Header.propTypes = {
  player: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
};
