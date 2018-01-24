process.env.NODE_ENV = 'test';

var chai = require('chai');
var chaiHttp = require('chai-http');
var assert = chai.assert;
var should = chai.should();
var expect = chai.expect;
var server = require("../app/server");

chai.use(chaiHttp);

describe("Arduino binary server", function() {
  describe("has a version id for the binary that", function() {
    var version = server.currentVersion;

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
    var version = server.currentVersion;

    it("returns 304 if version from request is the same as version being served", function(done) {
      chai.request(server).get('/bin/'+version).end(function(err, res) {
        res.should.have.status(304);
        done();
      });
    });

    it("serves a binary if version from request is different from version being served", function(done) {
      chai.request(server).get('/bin/'+version.substring(1)).end(function(err, res) {
        if (err) done(err);
        res.should.have.status(200);
        res.should.have.header('content-type');
        res.header['content-type'].should.be.equal('application/octet-stream');
        done();
      });
    });
  });

  describe("all other routes", function() {
    it("serve a random number between 0 and 100", function(done) {
      chai.request(server).get('/foo/').end(function(err, res) {
        if (err) done(err);
        res.should.have.status(200);
        res.should.have.header('content-type');
        parseFloat(res.text).should.be.a('number');
        parseFloat(res.text).should.be.gte(0);
        parseFloat(res.text).should.be.lte(100);
        var firstNumber = parseFloat(res.text);

        // to check for randomness
        chai.request(server).get('/bar/').end(function(err, res) {
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
