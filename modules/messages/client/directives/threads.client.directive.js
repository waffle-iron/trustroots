(function () {
  'use strict';

  angular
    .module('messages')
    .directive('threads', threadsDirective);

  /* @ngInject */
  function threadsDirective() {
    return {
      link: function (scope, elem, attr) {
        var element = elem[0];

        elem.bind('scroll', function() {
          if (element.scrollTop <= 0) {
            scope.$apply(attr.moremessages);
          }
        });
      }
    };
  }

}());
