'use strict';

/**
 * @ngdoc overview
 * @name publicApp
 * @description
 * # publicApp
 *
 * Main module of the application.
 * Configuration of routes to the video chat rooms
 */
angular
  .module('publicApp', [
    'ngRoute'
  ])
    
  .config(function ($routeProvider) {
    $routeProvider
    //existing room
      .when('/room/:roomId', {
        templateUrl: 'views/room.html',
        controller: 'RoomCtrl'
      })
    //standard room for new entrants 
      .when('/room', {
        templateUrl: 'views/room.html',
        controller: 'RoomCtrl',
      })
      .otherwise({
        redirectTo: '/room'
      });
  });

angular.module('publicApp')
    .constant('config', {
        //url for the appication to connect server with socket.io
        SIGNALING_SERVER_URL: https://rocky-citadel-89998.herokuapp.com;
    });
