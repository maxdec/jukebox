import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { pushState } from 'redux-router';
import Header from './Header';
import Footer from './Footer';
import * as PlayerActions from '../actions/player';

class App extends Component {
  render() {
    return (
      <div className="container">
        <Header player={this.props.player} actions={this.props.PlayerActions} />
        {this.props.children}
        <Footer />
      </div>
    );
  }
}

App.propsTypes = {
  pushState: PropTypes.func.isRequired,
  children: PropTypes.node,
  player: PropTypes.object.isRequired,

};

function mapStateToProps(state) {
  return {
    player: state.player,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    pushState: bindActionCreators(pushState, dispatch),
    PlayerActions: bindActionCreators(PlayerActions, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
