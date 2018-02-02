process.env.NODE_ENV = 'test';

var chai = require('chai');
var chaiHttp = require('chai-http');
var chaiSpies = require('chai-spies');
var should = chai.should();
var server = require("../app/server").server;
var fs = require("../app/server").fs;
var app = server.app;
var version = server.currentVersion;

chai.use(chaiHttp);
chai.use(chaiSpies);

before(function() {
  fs.mkdirSync(__dirname + '/../app/bin/is-a-version');
});
after(function () {
  fs.rmdirSync(__dirname + '/../app/bin/is-a-version');
  app.close();
});

describe("Arduino binary server", function() {
  describe("has a version id for the binary that", function() {
    it("is a string", function() {
      version.should.be.a('string');
    });

    it("is not the default string", function() {
      version.should.not.equal('deadbeef');
    });

    it("is a valid hash string", function() {
      version.should.match(/^[0-9a-fA-F]+$/);
    });
  });

  describe("route /bin/version", function() {
    it("serves a binary if version from request is different from version being served", function(done) {
      chai.request(app).get('/bin/'+version.substring(1)).end(function(err, res) {
        if (err) done(err);
        res.should.have.status(200);
        res.should.have.header('content-type');
        res.header['content-type'].should.be.equal('application/octet-stream');
        done();
      });
    });

    it("returns 304 if version from request is the same as version being served", function(done) {
      chai.request(app).get('/bin/'+version).end(function(err, res) {
        res.should.have.status(304);
        done();
      });
    });
  });

  describe("route /update/tag", function() {
    beforeEach(function() {
      chai.spy.on(fs, 'mkdirSync', function(){});
      chai.spy.on(fs, 'writeFileSync', function(){});

      chai.spy.on(server, 'setupBinaryVersion', function(){});
      chai.spy.on(server, 'request');
    });

    afterEach(function() {
      chai.spy.restore(fs);
      chai.spy.restore(server);
    });

    it("returns 404 if tag isn't a valid github release of tom-cube", function(done) {
      chai.request(app).get('/update/not-a-version').end(function(err, res) {
        res.should.have.status(404);
        server.request.should.have.been.called();
        server.setupBinaryVersion.should.not.have.been.called();
        done();
      });
    });

    it("doesn't download anything if version already available", function(done) {
      chai.request(app).get('/update/is-a-version').end(function(err, res) {
        res.should.have.status(200);
        server.request.should.not.have.been.called();
        server.setupBinaryVersion.should.have.been.called.with('is-a-version');
        done();
      });
    });

    it("downloads and serves a new version if it's available on github", function(done) {
      chai.request(app).get('/update/for-testing').end(function(err, res) {
        res.should.have.status(200);
        server.request.should.have.been.called();
        server.setupBinaryVersion.should.have.been.called.with('for-testing');
        done();
      });
    });
  });

  describe("all other routes", function() {
    it("serve a random number between 0 and 100", function(done) {
      chai.request(app).get('/foo/').end(function(err, res) {
        if (err) done(err);
        res.should.have.status(200);
        res.should.have.header('content-type');
        parseFloat(res.text).should.be.a('number');
        parseFloat(res.text).should.be.gte(0);
        parseFloat(res.text).should.be.lte(100);
        var firstNumber = parseFloat(res.text);

        // to check for randomness
        chai.request(app).get('/bar/').end(function(err, res) {
          if (err) done(err);
          res.should.have.status(200);
          res.should.have.header('content-type');
          parseFloat(res.text).should.be.a('number');
          parseFloat(res.text).should.be.gte(0);
          parseFloat(res.text).should.be.lte(100);
          parseFloat(res.text).should.not.be.equal(firstNumber);
          done();
        });
      });
    });
  });
});
