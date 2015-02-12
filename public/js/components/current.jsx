'use strict';
/* global helpers */

var Current = React.createClass({
  render: function () {
    var cx = React.addons.classSet;
    var iconClasses = cx({
      'fa': true,
      'fa-fw': true,
      'fa-2x': true,
      'fa-soundcloud': this.props.track.platform === 'soundcloud',
      'fa-youtube-play': this.props.track.platform === 'youtube'
    });

    var progress = { width: (this.props.track.progress || 0) + '%' };

    var content;
    if (this.props.track.title) {
      content = <div className="inner cover">
        <a href={this.props.track.url} target="_blank">
          <i className={iconClasses}></i>
          <img src={this.props.track.cover} alt="Cover" />
          <div className="progress">
            <div className="progress-bar progress-bar-danger" style={progress}></div>
          </div>
        </a>
        <h2 className="cover-heading">{this.props.track.title}</h2>
        <p className="lead">{this.props.track.artist} • {helpers.duration(this.props.track.duration)}</p>
        <p className="lead">
          <button className="btn btn-default" onClick={this.props.onVote}>
            <i className="fa fa-fast-forward"></i> {this.props.track.votes.favorable}/{this.props.track.votes.total}
          </button>
        </p>
      </div>;
    } else {
      content = <div className="inner cover" ng-show="currentTrack && !currentTrack.title">
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
});
