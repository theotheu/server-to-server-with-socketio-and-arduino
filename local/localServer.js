// localServer.js
var five = require("johnny-five");
var os = require("os");
var board = new five.Board();
var localConfig = require('../config/config.json');
var remoteServer = require("socket.io-client")(localConfig.remote.fqdn + ':' + localConfig.remote.port); // This is a client connecting to the SERVER 2
var led, button, potentiometer, potPrevVal, servo;

// Client
var socket = remoteServer.connect(localConfig.remote.fqdn + ':' + localConfig.remote.port);
board.on("ready", function () {

    console.log(Date.now(), "Board is now ready for reading from sensors and writing to actors.");

    // Create a new `push button` hardware instance.
    button = new five.Button(localConfig.local.pushButton);

    // Create a new `led` hardware instance.
    led = new five.Led(localConfig.local.led);
    led.off(); // start with led off

    // Create a new `potentiometer` hardware instance.
    potentiometer = new five.Sensor({
        pin: localConfig.local.potentiometer,
        freq: 250
    });


    // Create a new `servo` hardware instance.
    /**
     * https://github.com/rwaldron/johnny-five/blob/master/docs/servo.md
     */
    servo = new five.Servo({
        pin: localConfig.local.servo,
        // `type` defaults to standard servo.
        // For continuous rotation servos, override the default
        // by setting the `type` here
        type: "standard"
    });

    // socket events
    socket.on('connect', function () {
        var obj = {
            dateTime: Date.now(),
            actor: "os",
            action: null,
            description: "Laptop connected with server!",
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
        var obj = {
            dateTime: Date.now(),
            actor: "led",
            action: "strobe",
            description: "rate of strobe set",
            pin: localConfig.local.led,
            value: rate
        };

        console.log(obj);

        led.strobe(rate);

        socket.emit("boardSensor", obj);


    });

    socket.on('setServo', function (data) {
        var angle = parseInt(data, 10);
        if (angle > 175) {
            angle = 175;
        }
        var obj = {
            dateTime: Date.now(),
            actor: "servo",
            action: "to",
            description: "Set servo to degrees",
            pin: localConfig.local.servo,
            value: angle
        };

        console.log(obj);

        servo.to(angle); // half speed clockwise

        socket.emit("boardSensor", obj);

    });

    // Button Event API
    /**
     * http://node-ardx.org/exercises/7
     */
    button.on("down", function (value) {
        var obj = {
            dateTime: Date.now(),
            sensor: "pushButton",
            action: "down",
            description: "button pressed down",
            pin: localConfig.local.pushButton,
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
            description: "button released",
            pin: localConfig.local.pushButton,
            value: value,
            pressed: true
        };
        console.log(obj);

        socket.emit("boardSensor", obj);
    });

    button.on("hold", function (value) {
        var obj = {
            dateTime: Date.now(),
            sensor: "pushButton",
            action: "hold",
            description: "button hold",
            pin: localConfig.local.pushButton, // was 2
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
            pin: localConfig.local.pushButton, // was 2
            value: value,
            pressed: true
        };
        console.log(obj);

        socket.emit("boardSensor", obj);
    });


    potentiometer.on("data", function () {

        if (potPrevVal !== this.value) {

            var obj = {
                dateTime: Date.now(),
                sensor: "potentiometer",
                action: "up",
                description: "potentiometer value changed",
                pin: localConfig.local.potentiometer,
                value: this.value
            };
            console.log(obj);

            socket.emit("boardSensor", obj);

            potPrevVal = this.value;
        }
    });


});
