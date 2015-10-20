import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import History from '../components/History';
import {add} from '../actions/tracklist';

class HistoryPage extends Component {
  render() {
    return (
      <History tracks={this.props.history} addTrack={this.props.add} />
    );
  }
}

HistoryPage.propsTypes = {
  history: PropTypes.array.isRequired,
  add: PropTypes.func.isRequired,
};

export default connect(state => ({ history: state.history }), { add })(HistoryPage);
