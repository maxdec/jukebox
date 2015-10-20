import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import CurrentTrack from '../components/CurrentTrack';
import Tracklist from '../components/Tracklist';
import {doVote} from '../actions/votes';
import {add, addUrl} from '../actions/tracklist';

class CurrentPage extends Component {
  render() {
    return (
      <div>
        <CurrentTrack current={this.props.current} votes={this.props.votes} doVote={this.props.VotesActions.doVote} />
        <Tracklist tracks={this.props.tracklist} addUrl={this.props.addUrl} addTrack={this.props.add} />
      </div>
    );
  }
}

CurrentPage.propsTypes = {
  current: PropTypes.object.isRequired,
  votes: PropTypes.object.isRequired,
  tracklist: PropTypes.array.isRequired,
  doVote: PropTypes.func.isRequired,
  add: PropTypes.func.isRequired,
  addUrl: PropTypes.func.isRequired,
};

export default connect(state => ({
  current: state.current,
  votes: state.votes,
  tracklist: state.tracklist,
}), {
  doVote,
  add,
  addUrl
})(CurrentPage);
