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

server.cleanUpBinDirectory = function(mBinDirectory) {
  fs.unlink(mBinDirectory + '/version.json', function(err) {
    fs.rmdir(mBinDirectory, function(err) {});
  });
  fs.unlink(mBinDirectory + '/tom-cube.bin', function(err) {
    fs.rmdir(mBinDirectory, function(err) {});
  });
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
  var mBinDirectory = __dirname + '/bin/' + releaseTag;

  if(fs.existsSync(mBinDirectory)) {
    server.setupBinaryVersion(releaseTag);
    server.sendTextResponse(res, 200, "updated bin to version " + releaseTag);
  } else {
    var filesDownloaded = 0;
    var requestOptions = {};
    requestOptions.headers = { 'User-Agent': 'request' };

    var saveResponse = function(filename, filetype) {
      return function(error, response, body) {
        if(!error && response.statusCode == 200) {
          if(!fs.existsSync(mBinDirectory)) {
            fs.mkdirSync(mBinDirectory);
          }
          fs.writeFileSync(mBinDirectory + '/' + filename, body, filetype);

          if(++filesDownloaded > 1) {
            server.setupBinaryVersion(releaseTag);
            server.sendTextResponse(res, 200, "updated bin to version " + releaseTag);
          }
        } else {
          server.cleanUpBinDirectory(mBinDirectory);
          if(!res.headersSent) {
            server.sendTextResponse(res, 404, "version "+releaseTag+" not found");
          }
        }
      }
    }

    requestOptions.url = GIT_TAGS_URL + releaseTag;
    server.request(requestOptions, saveResponse('version.json', 'utf8'));

    requestOptions.url = GIT_RELEASES_URL + releaseTag + '/' + BIN_FILENAME;
    requestOptions.encoding = null;
    server.request(requestOptions, saveResponse('tom-cube.bin', 'binary'));
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
