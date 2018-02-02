var server = {};

var express = require('express');
var fs = require('fs');

var port = 8000;
var expressApp = express();
server.app = require('http').createServer(expressApp);
server.request = require('request');

const GIT_RELEASES_URL = 'https://github.com/thiagohersan/tom-cube/releases/download/';
const GIT_TAGS_URL = 'https://api.github.com/repos/thiagohersan/tom-cube/git/refs/tags/';
const BIN_FILENAME = 'tom-cube.bin';
var binDirectory = __dirname + '/bin/latest';

server.currentVersion = 'deadbeef';

server.setupBinaryVersion = function(releaseTag) {
  binDirectory = __dirname + '/bin/' + releaseTag;
  var versionJson = fs.readFileSync(binDirectory + '/version.json', 'utf8');
  server.currentVersion = JSON.parse(versionJson).object.sha;
  logExceptOnTest("serving binary version " + server.currentVersion);
}

server.sendTextResponse = function(res, code, text) {
  res.set('Content-Type', 'text/plain');
  res.status(code).send(text);
}

expressApp.get('/bin/:version', function(req, res) {
  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  ip = ip.match(/([0-9]+\.){3}([0-9]+)$/)[0];

  var logText = "binary request from: " + ip + " - ";

  if(req.params.version != server.currentVersion) {
    logExceptOnTest(logText + "sending version " + server.currentVersion);
    res.set('Content-Type', 'application/octet-stream');
    res.status(200).sendFile(BIN_FILENAME, { root: binDirectory });
  } else {
    logExceptOnTest(logText + "sending 304");
    server.sendTextResponse(res, 304, "");
  }
});

expressApp.get('/update/:tag', function(req, res) {
  var releaseTag = req.params.tag;

  if(fs.existsSync(__dirname + '/bin/' + releaseTag)) {
    server.setupBinaryVersion(releaseTag);
    server.sendTextResponse(res, 200, "updated bin to version " + releaseTag);
  } else {
    var requestOptions = {
      url: GIT_TAGS_URL + releaseTag,
      headers: {
        'User-Agent': 'request'
      }
    };

    server.request(requestOptions, function(error, versionResponse, versionBody) {
      if(!error && versionResponse.statusCode == 200) {
        requestOptions.url = GIT_RELEASES_URL + releaseTag + '/' + BIN_FILENAME;
        requestOptions.encoding = null;
        server.request(requestOptions, function(error, binaryResponse, binaryBody) {
          if(!error && binaryResponse.statusCode == 200) {
            var mBinDirectory = __dirname + '/bin/' + releaseTag;
            fs.mkdirSync(mBinDirectory);

            fs.writeFileSync(mBinDirectory + '/version.json', versionBody, 'utf8');
            fs.writeFileSync(mBinDirectory + '/tom-cube.bin', binaryBody, 'binary');

            server.setupBinaryVersion(releaseTag);
            server.sendTextResponse(res, 200, "updated bin to version " + releaseTag);
          } else{
            server.sendTextResponse(res, 404, "binary not found");
          }
        });
      } else {
        server.sendTextResponse(res, 404, "version info not found");
      }
    });
  }
});

expressApp.get('*', function (req, res) {
  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  ip = ip.match(/([0-9]+\.){3}([0-9]+)$/)[0];

  logExceptOnTest("request from: " + ip + " || at: " + req.params[0]);

  server.sendTextResponse(res, 200, ""+100*Math.random());
});

server.setupBinaryVersion('latest');
server.app.listen(port);

function logExceptOnTest(string) {
  if (process.env.NODE_ENV !== 'test') {
    console.log(string);
  }
}

module.exports = {
  fs: fs,
  server: server
}
