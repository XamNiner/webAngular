var express = require('express'),
    expressApp = express(),
    socketio = require('socket.io'),
    http = require('http'),
    server = http.createServer(expressApp),
    uuid = require('node-uuid'),
    rooms = {},
    userIds = {};

expressApp.use(express.static(__dirname + '/../public/dist/'));

exports.run = function(config) {
    //listen for client to connect to the server
    //attach socket.io
    server.listen(config.PORT); //listen to the configured port
    console.log('Listening on', config.PORT);
    socketio.listen(server, {log: false})
    .on('connection', function(socket) {
        var currentRoom, id;
        //attach event handlers
        //handle room inititalization and add clients socket to the list of sockets for the room
        socket.on('init', function(data, fn) {
            currentRoom = (data || {}).room || uuid.v4();
            var room = rooms[currentRoom];
            if (!data) {
                rooms[currentRoom] = [socket];
                id = userIds[currentRoom] = 0;
                fn(currentRoom, id);
                console.log('Room created with #', currentRoom);
            } else {
                if (!room) {
                    return;
                }
                userIds[currentRoom] += 1;
                id = userIds[currentRoom];
                fn(currentRoom, id);
                room.forEach(function (s) {
                    s.emit('peer.connected', {id: id});
                });
                room[id] = socket;
                console.log('Peer connected to room', currentRoom, 'with #', id);
            }
        });
        
        socket.on('msg', function(data) { //SDP message or ICE candidate
            var to = parseInt(data.to, 10);
            if (rooms[currentRoom] && rooms[currentRoom][to]) {
                console.log('Redirecting message to', to, 'by', data.by);
                rooms[currentRoom][to].emit('msg', data);
            } else {
                console.warn('Invalid User');
            }
        });
        
        socket.on('disconnect', function(){ //upon peer disconnect remove associated socket from list
            if (!currentRoom || !rooms[currentRoom]) {
                return;
            }
            delete rooms[currentRoom][rooms[currentRoom].indexOf(socket)];
            rooms[currentRoom].forEach(function(socket) {
                if (socket) {
                    socket.emit('peer.disconnected', {id: id}); //inform remaining peers about disconnect
                }
            });
        });
    });
};