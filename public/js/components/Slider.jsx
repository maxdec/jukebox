'use strict';

var React = require('react/addons');

module.exports = React.createClass({
  getInitialState: function () {
    return { perc: this.props.perc || 50 };
  },
  _handleClick: function (event) {
    var target  = event.target || event.srcElement;
    var rect    = target.getBoundingClientRect();
    var offsetX = event.clientX - rect.left;

    var sliderTotalWith = target.offsetWidth;
    var perc = Math.round(100 * offsetX / sliderTotalWith);
    this.setState({ perc: perc });
    this.props.onChange(perc);
  },
  render: function () {
    var barStyle = {
      width: this.state.perc + '%'
    };

    return (
      <div className="slider progress" ref="slider" onClick={this._handleClick}>
        <div className="progress-bar progress-bar-danger" style={barStyle}></div>
      </div>
    );
  }
});
