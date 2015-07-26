#!/usr/bin/env mocha -R spec

var assert = require("assert");

var msgpack = require("../index");
var TITLE = __filename.replace(/^.*\//, "") + ":";

var data = require("./example.json");

describe(TITLE, function() {
  it("msgpack", function() {
    var they = require("msgpack");
    assert.deepEqual(they.unpack(msgpack.encode(data)), data);
    assert.deepEqual(msgpack.decode(Buffer(they.pack(data))), data);
  });

  it("msgpack-js", function() {
    var they = require("msgpack-js");
    assert.deepEqual(they.decode(msgpack.encode(data)), data);
    assert.deepEqual(msgpack.decode(Buffer(they.encode(data))), data);
  });

  it("msgpack-js-v5", function() {
    var they = require("msgpack-js-v5");
    assert.deepEqual(they.decode(msgpack.encode(data)), data);
    assert.deepEqual(msgpack.decode(Buffer(they.encode(data))), data);
  });

  it("msgpack5", function() {
    var they = require("msgpack5")();
    assert.deepEqual(they.decode(msgpack.encode(data)), data);
    assert.deepEqual(msgpack.decode(Buffer(they.encode(data))), data);
  });

  it("msgpack-unpack", function() {
    var they = require("msgpack-unpack");
    assert.deepEqual(they(msgpack.encode(data)), data);
  });
});
