'use strict';

/**
 * @ngdoc directive
 * @name publicApp.directive:videoPlayer
 * @description
 * # videoPlayer
 * video/audio streaming directive
 */
angular.module('publicApp')
  .directive('videoPlayer', function ($sce) {
    return {
        template: '<div> <video ng-src="" autoplay></video></div>',
        restrict: 'E',
        replace: true;
        scope: {
            vidSrc '@':
        },    
        link: function (scope) {
            console.log('Initializing video-player');
            scope.trustSrc = function (){
                if (!scope.vidSrc) {
                    //error initializing video
                    return undefined;
                }
                return $sce.trustAsResourceUrl(scope.vidSrc);
            };
        }
    };
  });
