var express = require('express'),
    bodyParser = require('body-parser'),
    app = express(),
    genericConstants = require('./generic-constants')(),
    uuid = require('node-uuid');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

require('./cors-filter')(app, genericConstants);


var http = require('http').createServer(app).listen(8081, function() {
    console.log('Express server listening on port 8081');
});

var socketio = require('socket.io')(http);

var getRoomUsers = function(roomId) {
    return socketio.sockets.adapter.rooms[roomId];
};

var getRoomSocketIds = function(roomId) {
    var users = getRoomUsers(roomId);
    var keys = [];
    if (users)
        for (var k in users.sockets) {
            keys.push(k)
        };
    return keys;
}

var getUsersInfoExcept = function(socketId, roomId) {
    var users = getRoomUsers(roomId);
    var usersInfo = [];
    var keys = [];
    if (users)
        for (var k in users.sockets) {
            keys.push(k)
        };
    for (var i = 0; i < keys.length; i++) {
        if (keys[i] !== socketId) {
            var userInfo = socketio.sockets.connected[keys[i]].userInfo;
            usersInfo.push({
                email: userInfo.email,
                assignedUserColor: userInfo.assignedUserColor
            });
        }
    }
    return usersInfo;
}

socketio.on('connection', function(socket) {
    var userInfo = socket.handshake.query;
    var socketRef = socket;
    socketRef.userInfo = userInfo;
    var roomId = userInfo.roomId;
    socketRef.join(roomId);
    if (getRoomSocketIds(roomId).length === 1) {
        userInfo.isMaster = true;
        socketRef.emit('masterAssignEvent');
    } else {
        socketRef.broadcast.to(roomId).emit('noobSyncRequestEvent', {
            socketId: socketRef.id
        });
        socketRef.emit('roomiesListEvent', {
            roomies: getUsersInfoExcept(socketRef.id, roomId)
        });
        socketRef.broadcast.to(roomId).emit('newArrival', {
            assignedUserColor: userInfo.assignedUserColor,
            email: userInfo.email
        });
    }

    socketRef.on('contentSyncEvent', function(data) {
        socketio.sockets.connected[data.socketId].emit('contentSyncEvent', {
            content: data.content,
            timestamp: data.timestamp
        });
    });

    socketRef.on('deltaSyncEvent', function(data) {
        socket.broadcast.to(roomId).emit('deltaSyncEvent', {
            delta: data.delta,
            timestamp: data.timestamp
        });
    });

    socketRef.on('titleSyncEvent', function(data) {
        socket.broadcast.to(roomId).emit('titleSyncEvent', data);
    });

    socket.on('disconnect', function() {
        var users = getRoomSocketIds(roomId);
        if (users) {
            for (var i = 0; i < users.length; i++) {
                socketio.sockets.connected[users[i]].emit('someoneLeft', {
                    email: userInfo.email
                });
            };
        }
        if (socketRef.userInfo.isMaster && users.length) {
            var rand = Math.floor(Math.random() * users.length);
            var socketMaster = socketio.sockets.connected[users[rand]];
            socketMaster.userInfo.isMaster = true;
            socketMaster.emit('masterAssignEvent');
        }
    });
});