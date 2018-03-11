var redis = require('redis');
var redisClient = redis.createClient(6379, 'redis');

redisClient.on('ready', function() {
    console.log('Redis is ready');
});

redisClient.on('error', function() {
    console.log('Error in redis');
});
