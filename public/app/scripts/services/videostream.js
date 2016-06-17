'use strict';

/**
 * @ngdoc service
 * @name publicApp.VideoStream
 * @description
 * # VideoStream
 * Factory in the publicApp.
 * Gain access to the peers video and audio stream 
 */
angular.module('publicApp')
  .factory('VideoStream', function ($q) {
    var stream;
    return {
        get: function () {
            if (stream) {
                return $q.when(stream);
            } else {
                var d = $q.defer();
                navigator.getUserMedia({ //browser asks for permission
                    video: true,
                    audio: true
                }, function (s) {
                    stream = s;
                    d.resolve(stream);
                }, function (e) {
                    d.reject(e);
                });
                return d.promise;
            }
        }
    };
  });
