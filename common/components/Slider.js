import React, { Component, PropTypes } from 'react';

export default class Slider extends Component {
  // constructor(props) {
  //   super(props);
  //   _handleClick =
  // }
  _handleClick(event) {
    const target  = event.currentTarget;
    const rect    = target.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;

    const sliderTotalWith = target.offsetWidth;
    const perc = Math.round(100 * offsetX / sliderTotalWith);
    this.setState({ perc: perc });
  }

  render() {
    const barStyle = {
      width: this.state.perc + '%'
    };

    return (
      <div className="slider progress" ref="slider" onClick={this._handleClick}>
        <div className="progress-bar progress-bar-danger" style={barStyle}></div>
      </div>
    );
  }
}

Slider.propTypes = {
  perc: PropTypes.number
};

Slider.defaultProps = {
  perc: 50
};
