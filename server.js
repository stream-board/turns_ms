var app = require('express')();
var http = require('http').Server(app);
var port = process.env.PORT || 8000;

//In-memory DB
var redis = require('redis');
var redisClient = redis.createClient(6379, 'redis');

var io = require('socket.io')(http);

http.listen(port, function() {
    console.log('server started. listening on :' + port);
});

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket) {
    console.log('user connected');

    socket.on('register id', function(userNick, userId) {
        redisClient.set(userNick, socket.id, function () {
            console.log(userNick + 'in redis');
        });
    });

    socket.on('set admin id', function(userId) {
        redisClient.set('admin', socket.id, function () {
            console.log('admin id setted');
        });
    });

    socket.on('ask for board', function(userId, userNick) {
        console.log('user ' + userNick + ' ask');

        redisClient.get('admin', function(err, socketId) {
            console.log(socketId);
            socket.broadcast.to(socketId).emit(
                'ask for board',
                userId,
                userNick
            );
        });
    });

    socket.on('answer for board', function(adminRes, userId, userNick) {
        console.log(adminRes);
        var msg = 'Tu solicitud del tablero fue rechazada';
        if(adminRes) {
            msg = 'Tienes permiso para usar el tablero';
        };

        redisClient.get(userNick, function (err, socketId) {
            socket.broadcast.to(socketId).emit('answer for board',msg);
        })
    });

});


//TEST: Redis connection
redisClient.on('ready', function() {
    console.log('Redis is ready');
});

redisClient.on('error', function() {
    console.log('Error in redis');
});
