const express = require('express');
var fs = require('fs');

var port = 8000;
var app = express();

const BIN_DIRECTORY = "bin/";
const BIN_FILENAME = "tom-cube.bin";

app.currentVersion = 'deadbeef';
app.alreadyUpdated = {};

var versionJson = fs.readFileSync(__dirname + '/bin/version.json', 'utf8');
app.currentVersion = JSON.parse(versionJson).object.sha;

logExceptOnTest("serving binary version: " + app.currentVersion);

app.get('/bin/:version', function(req, res) {
  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  ip = ip.match(/([0-9]+\.){3}([0-9]+)$/)[0];

  logExceptOnTest("request from: " + ip + " for version: " + req.params.version);

  var needsUpdated = (!(ip in app.alreadyUpdated)) ||
                     (req.params.version != app.currentVersion);

  if(needsUpdated) {
    app.alreadyUpdated[ip] = '';
    res.set('Content-Type', 'application/octet-stream');
    res.status(200).sendFile(BIN_FILENAME, { root: __dirname + "/" + BIN_DIRECTORY });
  } else {
    res.set('Content-Type', 'text/plain');
    res.status(304).send("");
  }
});

app.get('*', function (req, res) {
  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  ip = ip.match(/([0-9]+\.){3}([0-9]+)$/)[0];

  logExceptOnTest("request from: " + ip + " || at: " + req.params[0]);

  res.set('Content-Type', 'text/plain');
  res.status(200).send(""+100*Math.random());
});

app.listen(port);

function logExceptOnTest(string) {
  if (process.env.NODE_ENV !== 'test') {
    console.log(string);
  }
}

module.exports = app;
