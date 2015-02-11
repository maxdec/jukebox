'use strict';

var Current = React.createClass({
  render: function () {
    return (
      <div className="alert alert-dismissable" tabindex="-1" ng-class="[type ? 'alert-' + type : null]">
        <button type="button" className="close" ng-click="$hide()">&times;</button>
        <h4 ng-bind="title"></h4>
        <span ng-bind-html="content"></span>
      </div>
    );
  }
});
