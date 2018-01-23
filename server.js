var port = 8000;

const spawn = require('child_process').spawn;
const express = require('express');
var crypto = require('crypto');

var app = express();

const ARDUINO_DIRECTORY = "tom-cube/";
const ARDUINO_SOURCE_FILES = [ARDUINO_DIRECTORY+"tom-cube.ino",
                              ARDUINO_DIRECTORY+"Trend.h",
                              ARDUINO_DIRECTORY+"Trend.cpp"];
const BIN_DIRECTORY = ARDUINO_DIRECTORY + "bin/";
const BIN_FILENAME = "tom-cube.bin";

const cat = spawn("cat", ARDUINO_SOURCE_FILES);

var currentVersion = "";

cat.stdout.on('data', function(data) {
  currentVersion = crypto.createHash('md5').update(data.toString()).digest("hex");
});

app.get('/bin/:version', function(req, res) {
  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  ip = ip.match(/([0-9]+\.){3}([0-9]+)$/)[0];

  console.log("ip: " + ip + " || version: " + req.params.version);

  if(req.params.version == currentVersion) {
    res.set('Content-Type', 'text/plain');
    res.status(304).send("");
  } else {
    res.set('Content-Type', 'application/octet-stream');
    res.status(200).sendFile(BIN_FILENAME, { root: __dirname + "/" + BIN_DIRECTORY });
  }
});

app.get('*', function (req, res) {
  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  ip = ip.match(/([0-9]+\.){3}([0-9]+)$/)[0];

  console.log("request from: " + ip + " || at: " + req.params[0]);

  res.set('Content-Type', 'text/plain');
  res.status(200).send(""+100*Math.random());
});

app.listen(port);
