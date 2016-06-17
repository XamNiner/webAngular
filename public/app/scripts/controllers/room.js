'use strict';

/**
 * @ngdoc function
 * @name publicApp.controller:RoomCtrl
 * @description
 * # RoomCtrl
 * Controller of the publicApp
 */
angular.module('publicApp')
  .controller('RoomCtrl', function ($sce, VideoStream, $location, $routeParams, $scope, Room) {
    //check for WebRTC support
    if (!window.RTCPeerConnection || !navigator.getUserMedia) {
        $scope.error = 'WebRTC is not supported by your browser. Try with Chrome or Firefox.'
        return;
    }
    
    var stream;
    
    VideoStream.get().then(function (s) { //VS - promise that gives access to the users video stream
        stream = s;
        Room.init(stream);
        stream = URL.createObjectURL(stream);
        if (!$routeParams.roomId) { //check for room ID and move to the specific room URL
            Room.createRoom().then(function (roomId) {
                $location.path('/room/' + roomId);
            });
        } else { //create new room
            Room.joinRoom($routeParams.roomId);
        }
    }, function () {
        $scope.error = 'No audio/video permissions. Please refresh your browser and allow access.'
    });
    $scope.peers = [];
    //add new video stream as element to the room
    Room.on('peer.stream', function (peer) {
        console.log('Client connected, adding stream');   
        $scope.peers.push({
            id: peer.id,
            stream: URL.createObjectURL(peer.stream)
        });
    });
    //remove peer and associated stream from the room
    Room.on('peer.disconnected', function (peer) {
        console.log('Client disconnected, removing stream');
        $scope.peers = $scope.peers.filter(function (p) {
            return p.id !== peer.id;
        });
    });
    
    $scope.getLocalVideo = function () {
        return $sce.trustAsResourceUrl(stream);
    };
  });
