import React, { Component, PropTypes } from 'react';

export default class Settings extends Component {
  _getNotify = () => (this.props.settings.notify);
  _getAutoplay = () => (this.props.settings.autoplay);
  _canNotify = () => ('Notification' in window);
  _switchAutoplay = () => { this.props.set('autoplay', !this.getAutoplay()); }

  _switchNotify = () => {
    if (!this._canNotify()) return;

    // We need to ask the user for permission
    if (Notification.permission === 'default') {
      Notification.requestPermission(function (permission) {
        // If the user is okay, let's create a notification
        if (permission === 'granted') {
          this.props.set('notify', !this.getNotify());
        }
      });
    } else if (Notification.permission === 'granted') {
      this.props.set('notify', !this.getNotify());
    }
  }

  render() {
    return (
      <div className="row">
        <div className="col-sm-6 col-sm-offset-3">
          <h2>Settings</h2>
          <form>
            <div className="input-group">
              <span className="input-group-addon">
                <input type="checkbox" value="notify" checked={this.getNotify()} onChange={this._switchNotify} />
              </span>
              <span className="form-control">Notifications</span>
              <span className="input-group-addon">
                <i className="fa fa-fw fa-bell"></i>
              </span>
            </div>
            <div className="input-group">
              <span className="input-group-addon">
                <input type="checkbox" value="autoplay" checked={this.getAutoplay()} onChange={this._switchAutoplay} />
              </span>
              <span className="form-control">Autoplay</span>
              <span className="input-group-addon">
                <i className="fa fa-fw fa-music"></i>
              </span>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

Settings.propTypes = {
  settings: PropTypes.object.isRequired,
  set: PropTypes.func.isRequired
};
