// Server 1
var io = require("socket.io").listen(8099); // This is the Server for SERVER 1
var five = require("johnny-five");
var board = new five.Board();
var localConfig = require('../config/config.json');
var remoteServer = require("socket.io-client")(localConfig.remote.fqdn + ':' + localConfig.remote.port); // This is a client connecting to the SERVER 2
var led;

remoteServer.on("connect", function () {
    console.log("other server connect");
    remoteServer.on('messsage', function (data) {
        // We received a message from Server 2
        // We are going to forward/broadcast that message to the "Lobby" room
        console.log('We are going to forward/broadcast that message to the "Lobby" room');
        //io.to('lobby').emit('message',data);
    });
});

io.sockets.on("connection", function (socket) {
    // Display a connected message
    console.log("User-Client Connected!");

    // Lets force this connection into the lobby room.
    //socket.join('lobby');

    // Some roster/user management logic to track them
    // This would be upto you to add :)

    // When we receive a message...
    socket.on("message", function (data) {
        // We need to just forward this message to our other guy
        // We are literally just forwarding the whole data packet
        remoteServer.emit("message", data);
    });

    socket.on("disconnect", function (data) {
        // We need to notify Server 2 that the client has disconnected
        remoteServer.emit("message", "UD," + socket.id);

        // Other logic you may or may not want
        // Your other disconnect code here
    });
});

// Client
//var socket = remoteServer.connect('http://server7.tezzt.nl:8100');
var socket = remoteServer.connect(localConfig.remote.fqdn + ':' + localConfig.remote.port);
socket.on('connect', function () {

    socket.on('setMilliseconds', function (data) {
        var rate = parseInt(data, 10);
        console.log("We got a new flash rate (" + rate +  ' milliseconds). If the board is ready, we will update the flash rate.\n');

        // if board is ready
        if (board.isReady) {
            console.log("Board is ready. Updating the flashing rate to ", rate);
            led.strobe(rate);
            socket.emit("localMessage", "Flash rate set to " + rate);
        } else {
            console.log('The board is not ready...');
            socket.emit("localMessage", "Board not yet ready...");

        }

    });
});

// Initialize the board
board.on("ready", function() {
    led = new five.Led(13);
    led.off(); // on off every second
});