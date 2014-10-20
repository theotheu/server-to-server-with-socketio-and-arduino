// localServer.js
var io = require("socket.io").listen(8099); // This is the Server for SERVER 1
var five = require("johnny-five");
var os = require("os");
var board = new five.Board();
var localConfig = require('../config/config.json');
var remoteServer = require("socket.io-client")(localConfig.remote.fqdn + ':' + localConfig.remote.port); // This is a client connecting to the SERVER 2
var led, button, potentiometer;

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
var socket = remoteServer.connect(localConfig.remote.fqdn + ':' + localConfig.remote.port);
board.on("ready", function () {

    console.log(Date.now(), "Board is now ready for reading from sensors and writing to actors.");

    // Create a new `push button` hardware instance.
    button = new five.Button(2); // pin 2

    // Create a new `led` hardware instance.
    led = new five.Led(13); // pin 13
    led.off(); // start with led off

    // Create a new `potentiometer` hardware instance.
    potentiometer = new five.Sensor({
        pin: "A0",
        freq: 250
    });



    board.repl.inject({
        button: button,
        led:led,
        pot: potentiometer
    });

    // socket events
    socket.on('connect', function () {
        var obj = {
            dateTime: Date.now(),
            actor: "os",
            action: null,
            description: "connected!",
            pin: null,
            value: null,
            detail: {
                hostname: os.hostname(),
                networkInterfaces: os.networkInterfaces()
            }
        };
        console.log(obj);
        socket.emit("boardSensor", obj);

    });

    socket.on('setMilliseconds', function (data) {
        var rate = parseInt(data, 10);
        console.log("We got a new flash rate (" + rate + ' milliseconds). If the board is ready, we will update the flash rate.\n');

        // if board is ready
        if (board.isReady) {
            var obj = {
                dateTime: Date.now(),
                actor: "led",
                action: "strobe",
                description: "rate of strobe set",
                pin: 13,
                value: rate
            };

            console.log(obj);

            led.strobe(rate);

            socket.emit("boardSensor", obj);

        } else {
            console.log('The board is not ready...');
            socket.emit("localMessage", "Board not yet ready...");

        }

    });

    /**
     * http://node-ardx.org/exercises/7
     */
    button.on("down", function (value) {
        console.log('2221');
        var obj = {
            dateTime: Date.now(),
            sensor: "pushButton",
            action: "down",
            description: "button pressed down",
            pin: 2,
            value: value,
            pressed: true
        };
        console.log(obj);

        //socket.emit("boardSensor", obj);
    });

    button.on("hold", function (value) {
        var obj = {
            dateTime: Date.now(),
            sensor: "pushButton",
            action: "hold",
            description: "button hold",
            pin: 2,
            value: value,
            pressed: true
        };
        console.log(obj);

        socket.emit("boardSensor", obj);
    });

    button.on("up", function (value) {
        var obj = {
            dateTime: Date.now(),
            sensor: "pushButton",
            action: "up",
            description: "button pressed up",
            pin: 2,
            value: value,
            pressed: true
        };
        console.log(obj);

        socket.emit("boardSensor", obj);
    });


    potentiometer.on("data", function() {
        console.log(this.value, this.raw);
        var obj = {
            dateTime: Date.now(),
            sensor: "potentiometer",
            action: "up",
            description: "potentiometer value changed",
            pin: "A0",
            value: this.value
        };
        console.log(obj);

        socket.emit("boardSensor", obj);
    });
});
