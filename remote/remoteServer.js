// Server 2
var express = require("express"),
    app = express(),
    server = require("http").createServer(app),
    io = require("socket.io").listen(server),
    localConfig = require('../config/config.json'),
    port = localConfig.remote.port;

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html");
});

server.listen(port, function() {
    console.log('Listening on port ' + port);
});

io.sockets.on("connection",function(socket){
    // Display a connected message
    console.log("Server-Client Connected!");

    socket.on("setMilliseconds", function (data) {
        console.log('setting milliseconds on arduino to', data);
        io.sockets.emit("setMilliseconds", data);
    });

    // When we receive a message...
    socket.on("localMessage",function(data){
        console.log('localMessage from laptop', data);
        io.sockets.emit('localMessage', data);
        // We got a message... I dunno what we should do with this...
    });
});