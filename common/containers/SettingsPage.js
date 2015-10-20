import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import Settings from '../components/Settings';
import {set} from '../actions/settings';

class SettingsPage extends Component {
  render() {
    return (
      <Settings settings={this.props.settings} set={this.props.set} />
    );
  }
}

SettingsPage.propsTypes = {
  settings: PropTypes.object.isRequired,
  set: PropTypes.func.isRequired,
};

export default connect(state => ({ settings: state.settings }), { set })(SettingsPage);
