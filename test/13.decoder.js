#!/usr/bin/env mocha -R spec

var assert = require("assert").strict;
var msgpack = require("../index");
var TITLE = "13.decoder.js";

var source = {"foo": "bar"};
var packed = msgpack.encode(source);

describe(TITLE, function() {

  it("Decoder().decode(obj)", function(done) {
    var decoder = new msgpack.Decoder();
    decoder.on("data", function(data) {
      assert.deepEqual(data, source);
    });
    decoder.on("end", done);
    decoder.decode(packed);
    decoder.end();
  });

  it("Decoder().end(obj)", function(done) {
    var decoder = new msgpack.Decoder();
    decoder.on("data", function(data) {
      assert.deepEqual(data, source);
    });
    decoder.on("end", done);
    decoder.end(packed);
  });
});
