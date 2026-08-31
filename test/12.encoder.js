#!/usr/bin/env mocha -R spec

var assert = require("assert");
var msgpack = require("../index");
var TITLE = "12.encoder.js";

var source = {"foo": "bar"};
var packed = toArray(msgpack.encode(source));

describe(TITLE, function() {

  it("Encoder().encode(obj)", function(done) {
    var encoder = new msgpack.Encoder();
    encoder.on("data", function(data) {
      assert.deepEqual(toArray(data), packed);
    });
    encoder.on("end", done);
    encoder.encode(source);
    encoder.end();
  });

  it("Encoder().end(obj)", function(done) {
    var encoder = new msgpack.Encoder();
    encoder.on("data", function(data) {
      assert.deepEqual(toArray(data), packed);
    });
    encoder.on("end", done);
    encoder.end(source);
  });
});

function toArray(buffer) {
  return Array.prototype.slice.call(buffer);
}
