'use strict';

angular.module('jukebox')
.directive('slider', [function () {
  return {
    restrict: 'E',
    replace: true,
    scope: {value: '='},
    link: function (scope, element) {
      scope.style = {
        width: scope.value + '%'
      };

      scope.set = function ($event) {
        var width = Math.round(100 * $event.offsetX / element[0].offsetWidth);
        scope.value = width;
        scope.style.width = width + '%';
      };

      scope.$watch('value', function (val) {
        if (val) scope.style.width = val + '%';
      });
    },
    templateUrl: 'slider',
  };
}]);
