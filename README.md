#Server to server with socket.io and arduino

Purpose is to have a web enabled arduino connection.

Therefor we need two node instances.

One on a remote server and one on your laptop.

##Wiring
![Schema](https://raw.githubusercontent.com/theotheu/server-to-server-with-socketio-and-arduino/master/assets/schema_bb.png)

##Installation
1. Connect the Arduino to your laptop
1. Install Firmata on your Arduino. Select in your Arduino, File > Examples > Firmata > StandardFirmata
1. Configure your application in /config/config.json
1. Run `npm install` in the local directory for your *laptop*.
1. Run `npm install` in the remote directory for your *server*.
1. Point your browser to `http://server7.tezzt.nl:3000`, or the server you are using (not localhost).

##Infrastructure
![Infra][https://docs.google.com/drawings/d/1pj94xgUijcOLkpKB5FcPyc16BTWTQOqOY7AHEqqS7TY/edit?usp=sharing]

<img src="https://docs.google.com/drawings/d/1pj94xgUijcOLkpKB5FcPyc16BTWTQOqOY7AHEqqS7TY/edit?usp=sharing" alt="infra">
