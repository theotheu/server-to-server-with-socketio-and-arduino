// remoteServer.js
var express = require("express"),
    app = express(),
    server = require("http").createServer(app),
    io = require("socket.io").listen(server),
    localConfig = require('../config/config.json'),
    port = localConfig.remote.port;

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html");
});

server.listen(port, function () {
    console.log('Listening on port ' + port);
});

io.sockets.on("connection", function (socket) {

    io.sockets.emit('logMessage', {
        dateTime: Date.now(),
        data: "Connected with server."
    });

    socket.on("setMilliseconds", function (data) {
        console.log('setting milliseconds on arduino to', data);
        io.sockets.emit("setMilliseconds", data);
    });

    socket.on("setServo", function (data) {
        console.log('setting servo to degrees', data);
        io.sockets.emit("setServo", data);
    });

    // When we receive a message...
    socket.on("boardSensor", function (data) {
        console.log('boardSensor', data);

        io.sockets.emit('logMessage', {
            dateTime: Date.now(),
            data: data
        });
    });

    // When we receive a message...
    socket.on("pushButton", function (data) {
        console.log('pushButton', data);
        io.sockets.emit('logMessage', {
            dateTime: Date.now(),
            data: data
        });
    });


});