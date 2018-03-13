var express  = require('express');
var app = express();
var http = require('http').Server(app);
var port = process.env.PORT || 8000;

//In-memory DB
var redis = require('redis');
var redisClient = redis.createClient(6379, 'redis');

var io = require('socket.io')(http);

http.listen(port, function() {
    console.log('server started. listening on :' + port);
});

app.use(express.static('views'));

app.get('/', function(req, res) {
    res.sendFiles(__dirname + '/views/index.html');
});

io.on('connection', function(socket) {
    console.log('user connected');

    socket.on('registerId', function(userNick, userId) {
        redisClient.set(userNick, socket.id, function () {
            console.log(userNick + 'in redis');
        });
    });

    socket.on('setAdminId', function(userId) {
        redisClient.set('admin', socket.id, function () {
            console.log('admin id setted');
        });
    });

    socket.on('askForBoard', function(userId, userNick) {
        console.log('user ' + userNick + ' ask');

        redisClient.get('admin', function(err, socketId) {
            console.log(socketId);
            socket.broadcast.to(socketId).emit(
                'askForBoard',
                userId,
                userNick
            );
        });
    });

    socket.on('answerForBoard', function(adminRes, userId, userNick) {
        console.log(adminRes);
        var msg = 'Tu solicitud del tablero fue rechazada';
        if(adminRes) {
            msg = 'Tienes permiso para usar el tablero';
        };

        redisClient.get(userNick, function (err, socketId) {
            socket.broadcast.to(socketId).emit('answerForBoard',msg);
        })
    });

    socket.on('restorePermission', function () {

    })

});


//TEST: Redis connection
redisClient.on('ready', function() {
    console.log('Redis is ready');
});

redisClient.on('error', function() {
    console.log('Error in redis');
});
