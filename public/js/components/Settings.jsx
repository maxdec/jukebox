'use strict';
/* global Notification */

var React = require('react/addons');
var SettingsActions = require('../actions/SettingsActions');
var SettingsStore = require('../stores/SettingsStore');

module.exports = React.createClass({
  componentDidMount: function () {
    SettingsStore.addChangeListener(this._onChange);
  },
  componentWillUnmount: function () {
    SettingsStore.removeChangeListener(this._onChange);
  },
  _onChange: function () {
    this.forceUpdate();
  },
  _canNotify: function () {
    return ('Notification' in window);
  },
  _switchNotify: function () {
    if (!this._canNotify()) return;

    // We need to ask the user for permission
    if (Notification.permission === 'default') {
      Notification.requestPermission(function (permission) {
        // If the user is okay, let's create a notification
        if (permission === 'granted') {
          SettingsActions.set('notify', !SettingsStore.get('notify'));
        }
      });
    } else if (Notification.permission === 'granted') {
      SettingsActions.set('notify', !SettingsStore.get('notify'));
    }
  },
  _switchAutoplay: function () {
    SettingsActions.set('autoplay', !SettingsStore.get('autoplay'));
  },
  render: function () {
    return (
      <div className="row">
        <div className="col-sm-6 col-sm-offset-3">
          <h2>Settings</h2>
          <form>
            <div className="input-group">
              <span className="input-group-addon">
                <input type="checkbox" value="notify" checked={SettingsStore.get('notify')} onChange={this._switchNotify} />
              </span>
              <span className="form-control">Notifications</span>
              <span className="input-group-addon">
                <i className="fa fa-fw fa-bell"></i>
              </span>
            </div>
            <div className="input-group">
              <span className="input-group-addon">
                <input type="checkbox" value="autoplay" checked={SettingsStore.get('autoplay')} onChange={this._switchAutoplay} />
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
});
