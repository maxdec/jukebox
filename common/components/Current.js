import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import helpers from '../utils/helpers';

export default class Current extends Component {

  render() {
    const iconClasses = classNames({
      'fa': true,
      'fa-fw': true,
      'fa-2x': true,
      'fa-soundcloud': this.props.current.platform === 'soundcloud',
      'fa-youtube-play': this.props.current.platform === 'youtube'
    });

    const progress = { width: (this.props.current.progress || 0) + '%' };

    let content;
    if (this.props.current.title) {
      content = <div className="inner cover">
        <a href={this.props.current.url} target="_blank">
          <i className={iconClasses}></i>
          <img src={this.props.current.cover} alt="Cover" />
          <div className="progress">
            <div className="progress-bar progress-bar-danger" style={progress}></div>
          </div>
        </a>
        <h2 className="cover-heading">{this.props.current.title}</h2>
        <p className="lead">{this.props.current.artist} • {helpers.duration(this.props.current.duration)}</p>
        <p className="lead">
          <button className="btn btn-default" onClick={this.props.doVote}>
            <i className="fa fa-fast-forward"></i> {this.props.votes.favorable}/{this.props.votes.total}
          </button>
        </p>
      </div>;
    } else {
      content = <div className="inner cover">
        <h1 className="cover-heading">Nothing playing...</h1>
      </div>;
    }

    return (
      <div className="row">
        <div className="col-xs-12">
          {content}
        </div>
      </div>
    );
  }
}

Current.propTypes = {
  current: PropTypes.object.isRequired,
  votes: PropTypes.object.isRequired,
  doVote: PropTypes.func.isRequired,
};
