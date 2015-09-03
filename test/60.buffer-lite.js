#!/usr/bin/env mocha -R spec

var assert = require("assert");

var msgpack = require("../index");
var BufferLite = require("../lib/buffer-lite");
var TITLE = __filename.replace(/^.*\//, "");

describe(TITLE, function() {

  it("BufferLite.writeUint64BE() 1...", function() {
    var exp = [
      [0xcf, 0, 0, 0, 0, 0, 0, 0, 1], // 1
      [0xcf, 0, 0, 0, 0, 0, 0, 1, 0], // 256
      [0xcf, 0, 0, 0, 0, 0, 1, 0, 0], // 65536
      [0xcf, 0, 0, 0, 0, 1, 0, 0, 0],
      [0xcf, 0, 0, 0, 1, 0, 0, 0, 0],
      [0xcf, 0, 0, 1, 0, 0, 0, 0, 0],
      [0xcf, 0, 1, 0, 0, 0, 0, 0, 0],
      [0xcf, 1, 0, 0, 0, 0, 0, 0, 0]
    ];
    var val = 1;
    for (var i = 0; i < exp.length; i++) {
      var buffer = Buffer(9);
      buffer[0] = 0xcf;
      BufferLite.writeUint64BE.call(buffer, val, 1);
      assert.deepEqual(buffer, Buffer(exp[i]));
      assert.equal(msgpack.decode(buffer), val);
      val *= 256;
    }
  });

  it("BufferLite.writeUint64BE() 32767...", function() {
    var exp = [
      [0xcf, 0, 0, 0, 0, 0, 0, 0x7F, 0xFF], // 32767
      [0xcf, 0, 0, 0, 0, 0, 0x7F, 0xFF, 0],
      [0xcf, 0, 0, 0, 0, 0x7F, 0xFF, 0, 0],
      [0xcf, 0, 0, 0, 0x7F, 0xFF, 0, 0, 0],
      [0xcf, 0, 0, 0x7F, 0xFF, 0, 0, 0, 0],
      [0xcf, 0, 0x7F, 0xFF, 0, 0, 0, 0, 0],
      [0xcf, 0x7F, 0xFF, 0, 0, 0, 0, 0, 0]
    ];
    var val = 32767;
    for (var i = 0; i < exp.length; i++) {
      var buffer = Buffer(9);
      buffer[0] = 0xcf;
      BufferLite.writeUint64BE.call(buffer, val, 1);
      assert.deepEqual(buffer, Buffer(exp[i]));
      assert.equal(msgpack.decode(buffer), val);
      val *= 256;
    }
  });

  it("BufferLite.writeInt64BE() -2...", function() {
    var exp = [
      [0xd3, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFE], // -2
      [0xd3, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFE, 0xFF], // -257
      [0xd3, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFE, 0xFF, 0xFF], // -65537
      [0xd3, 0xFF, 0xFF, 0xFF, 0xFF, 0xFE, 0xFF, 0xFF, 0xFF],
      [0xd3, 0xFF, 0xFF, 0xFF, 0xFE, 0xFF, 0xFF, 0xFF, 0xFF],
      [0xd3, 0xFF, 0xFF, 0xFE, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF],
      [0xd3, 0xFF, 0xFE, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF],
      [0xd3, 0xFE, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF]
    ];
    var value = 1;
    for (var i = 0; i < exp.length; i++) {
      var buffer = Buffer(9);
      buffer[0] = 0xd3;
      var val = -value - 1;
      BufferLite.writeInt64BE.call(buffer, val, 1);
      assert.deepEqual(buffer, Buffer(exp[i]));
      assert.equal(msgpack.decode(buffer), val);
      value *= 256;
    }
  });

  it("BufferLite.writeInt64BE() -32768...", function() {
    var exp = [
      [0xd3, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x80, 0], // -32768
      [0xd3, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x80, 0, 0xFF],
      [0xd3, 0xFF, 0xFF, 0xFF, 0xFF, 0x80, 0, 0xFF, 0xFF],
      [0xd3, 0xFF, 0xFF, 0xFF, 0x80, 0, 0xFF, 0xFF, 0xFF],
      [0xd3, 0xFF, 0xFF, 0x80, 0, 0xFF, 0xFF, 0xFF, 0xFF],
      [0xd3, 0xFF, 0x80, 0, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF],
      [0xd3, 0x80, 0, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF]
    ];
    var val = -32768;
    for (var i = 0; i < exp.length; i++) {
      var buffer = Buffer(9);
      buffer[0] = 0xd3;
      BufferLite.writeInt64BE.call(buffer, val, 1);
      assert.deepEqual(buffer, Buffer(exp[i]));
      assert.equal(msgpack.decode(buffer), val);
      val *= 256;
      val += 255;
    }
  });
});
