#Server to server with socket.io and arduino

Purpose is to have a web enabled arduino connection.

Therefor we need ywo node instances.

One on a remote server and one on your laptop.

##Installation
1. Connect the Arduino to your laptop
1. Install Firmata on your Arduino. Select in your Arduino, File > Examples > Firmata > StandardFirmata
1. Configure your application in /config/config.json
1. Run `npm install` in the local directory for your laptop.
1. Run `npm install` in the remote directory for your server.
