const express = require('express');
require('dotenv').config()

var port = 8000;
var app = express();

const BIN_DIRECTORY = "bin/";
const BIN_FILENAME = "tom-cube.bin";

var currentVersion = process.env.LATEST_COMMIT_HASH || 'deadbeef';

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
