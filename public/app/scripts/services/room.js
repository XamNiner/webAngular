'use strict';

/**
 * @ngdoc service
 * @name publicApp.Room
 * @description
 * # Room
 * Factory in the publicApp.
 */
angular.module('publicApp')
//Io - wrapped socket.io global function
//$q - promise based interface
  .factory('Room', function ($rootScope, $q, Io, config) {
    var iceConfig = {'iceServers': [{ 'url': 'stun:stun.l.google.com:19302' }]},
        peerConnections = {},
        currentId, roomId,
        stream;
    
    //associate an ID with a RTCPeerConnection
    function getPeerConnection(id) {
        if (peerConnections[id]) {
            return peerConnections[id];
        }
        var pc = new RTCPeerConnection(iceConfig);
        peerConnections[id] = pc;
        pc.addStream(stream);
        pc.onicecandidate = function (evnt) {
            socket.emit('msg', { by: currentId, to: id, ice: evnt.candidate, type: 'ice'});
        };
        //connection between peers successful
        pc.onaddstream = function (evnt) {
            console.log('Received new stream');
            //can trigger stream event --> display video
            api.trigger('peer.stream', [{
                id: id,
                stream: evnt.stream
            }]);
            if (!$rootScope.$$digest) {
                $rootScope.$apply();
            }
        };
        return pc;
    }
    
    //invoked once new peer joins a room
    function makeOffer(id) {
        var pc = getPeerConnection(id);
        //send the offer to the new peer (attached handler)
        pc.createOffer(function (sdp) {
            pc.setLocalDescription(sdp);
            console.log('Creating offer for', id);
            socket.emit('msg', { by: currentId, to: id, sdp: sdp, type: 'sdp-offer'});
        }, function (e) {
            console.log(e);
        },
        {mandatory: {OfferToReceiveVideo: true, OfferToReceiveAudio: true}});
    }
    
    function handleMessage(data) {
        var pc = getPeerConnection(data.by);
        //handle 3 different message types
        switch (data.type) {
            //joined a room and peer inside the room wants to init connection    
            case 'sdp-offer':
                pc.setRemoteDescription(new RTCSessionDescription(data.sdp), function() {
                    console.log('Setting remote description by offer');
                    //send answer (ICE candidate, video codec) to the peer via the server
                    pc.createAnswer(function (sdp) {
                        pc.setLocalDescription(sdp);
                        socket.emit('msg', { by: currentId, to: data.by, sdp: sdp, type: 'sdp-answer'});
                    });
                });
                break;
            //send an SDP answer and try to make a connecteion (problem with symmetric NAT)    
            case 'sdp-answer':
                pc.setRemoteDescription(new RTCSessionDescription(data.sdp), function(){
                    console.log('Setting remote description by answer');   
                }, function(e) {
                    console.error(e);
                });
                break;
            case 'ice':
                if (data.ice) {
                    console.log('Adding ice candidate');
                    pc.addIceCandidate(new RTCIceCandidate(data.ice));
                }
                break;
        }
    }
    
    var socket = Io.connect(config.SIGNALING_SERVER_URL), //address of the app site to join
        connected = false;
    
    function addHandlers(socket) {
        socket.on('peer connected', function(params){
            makeOffer(params.id);
        });
        socket.on('peer disconnected', function(data) {
            api.trigger('peer.disconnected', [data]);
            if (!$rootScope.$$digest) {
                $rootScope.$apply();
            }
        });
        socket.on('msg', function(data) {
            handleMessage(data);
        });
    }
    
    //public api functionality
    var api = {
        joinRoom: function(r) {
            //enter a room and add own Id to the assigned ids for this room
            if (!connected) {
                //start new sdp offer for the new peer
                socket.emit('init', { room: r}, function(roomid, id) {
                    currentId = id;
                    roomId = roomid;
                });
                connected = true;
            }
        },
        createRoom: function() {
            var d = $q.defer();
            socket.emit('init', null, function(roomid, id) {
                d.resolve(roomid);
                roomId = roomid;
                currentId = id;
                connected = true;
            });
            return d.promise;
        },
        //start the room service
        init: function(s){
            stream = s;
        }
    };
    
    EventEmitter.call(api);
    Object.setPrototypeOf(api, EventEmitter.prototype);
    
    addHandlers(socket);
    return api;
  });