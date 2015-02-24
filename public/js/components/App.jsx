'use strict';

var React = require('react/addons');
var Header = require('./Header.jsx');
var Footer = require('./Footer.jsx');
var Current = require('./Current.jsx');
var Tracklist = require('./Tracklist.jsx');
var History = require('./History.jsx');
var Settings = require('./Settings.jsx');

module.exports = React.createClass({
  getInitialState: function () {
    return {
      view: 'current'
    };
  },
  _navigate: function (view) {
    if (view in { current: 1, history: 1, settings: 1 }) {
      this.setState({ view: view });
    }
  },
  render: function () {
    var mainView;
    if (this.state.view === 'current') {
      mainView = <div>
        <Current />
        <Tracklist />
      </div>;
    } else if (this.state.view === 'history') {
      mainView = <History />;
    } else if (this.state.view === 'settings') {
      mainView = <Settings />;
    }

    return (
      <div className="container">
        <Header onNavigate={this._navigate} view={this.state.view} />
        {mainView}
        <Footer />
      </div>
    );
  }
});
