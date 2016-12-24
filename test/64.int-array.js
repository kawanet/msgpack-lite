#!/usr/bin/env mocha -R spec

var assert = require("assert");
var msgpack = require("../index");

var TITLE = __filename.replace(/^.*\//, "");

describe(TITLE, function() {
  it("encode", function() {
    var data = [ 298080447363 ];
    var encoded = msgpack.encode(data);
    var expected = new Buffer([0x91, 0xcf, 0x00, 0x00, 0x00, 0x45, 0x66, 0xfa, 0xab, 0x83]);
    // msgpack-lite serializes as floats <Buffer 91 cb 42 51 59 be aa e0 c0 00>    
    assert.equal(new Array(expected), new Array(encoded));
  });
});
