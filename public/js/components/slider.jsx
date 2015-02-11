'use strict';

var Slider = React.createClass({
  getInitialState: function () {
    return { perc: this.props.perc || 50 };
  },
  handleClick: function () {
    var sliderTotalWith = this.refs.slider.getDOMNode().offsetWidth;
    var perc = Math.round(100 * event.offsetX / sliderTotalWith);
    this.setState({ perc: perc });
    this.props.onChange(perc);
  },
  render: function () {
    var barStyle = {
      width: this.state.perc + '%'
    };

    return (
      <div className="slider progress" ref="slider" onClick={this.handleClick}>
        <div className="progress-bar" style={barStyle}></div>
      </div>
    );
  }
});
