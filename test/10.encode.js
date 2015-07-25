#!/usr/bin/env mocha -R spec

var assert = require("assert");
var msgpack = require("../index");
var TITLE = __filename.replace(/^.*\//, "") + ":";

describe(TITLE, function() {

  // positive fixint -- 0x00 - 0x7f
  it("00-7f: positive fixint", function() {
    assert.deepEqual(msgpack.encode(0x00), Buffer([0x00]));
    assert.deepEqual(msgpack.encode(0x7F), Buffer([0x7F]));
  });

  // fixmap -- 0x80 - 0x8f
  it("80-8f: fixmap", function() {
    assert.deepEqual(msgpack.encode({}), Buffer([0x80]));

    var map = {a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9, j: 10, k: 11, l: 12, m: 13, n: 14, o: 15};
    var array = [0x8F];
    Object.keys(map).forEach(function(key) {
      array.push(0xa1, key.charCodeAt(0), map[key]);
    });
    assert.deepEqual(msgpack.encode(map), Buffer(array));
  });

  // fixarray -- 0x90 - 0x9f
  it("90-9f: fixarray", function() {
    assert.deepEqual(msgpack.encode([]), Buffer([0x90]));

    var array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
    assert.deepEqual(msgpack.encode(array), Buffer.concat([Buffer([0x9F]), Buffer(array)]));
  });

  // fixstr -- 0xa0 - 0xbf
  it("a0-bf: fixstr", function() {
    assert.deepEqual(msgpack.encode(""), Buffer([0xa0]));

    var str = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
    assert.deepEqual(msgpack.encode(str), Buffer.concat([Buffer([0xBF]), Buffer(str)]));
  });

  // nil -- 0xc0
  it("c0: nil", function() {
    assert.deepEqual(msgpack.encode(null), Buffer([0xc0]));
  });

  // false -- 0xc2
  // true -- 0xc3
  it("c2-c3: boolean", function() {
    assert.deepEqual(msgpack.encode(false), Buffer([0xc2]));
    assert.deepEqual(msgpack.encode(true), Buffer([0xc3]));
  });

  // bin 8 -- 0xc4
  // bin 16 -- 0xc5
  // bin 32 -- 0xc6
  it("c4-c6: bin 8/16/32", function() {
    var bin8 = Buffer(1);
    var bin16 = Buffer(256);
    var bin32 = Buffer(65536);
    assert.deepEqual(msgpack.encode(bin8), Buffer.concat([Buffer([0xc4, 1]), bin8]));
    assert.deepEqual(msgpack.encode(bin16), Buffer.concat([Buffer([0xc5, 1, 0]), bin16]));
    assert.deepEqual(msgpack.encode(bin32), Buffer.concat([Buffer([0xc6, 0, 1, 0, 0]), bin32]));
  });

  // float 32 -- 0xca -- NOT SUPPORTED
  it("ca-cb: float 32/64", function() {
    var float64 = msgpack.encode(0.5);
    assert.equal(float64.length, 9);
    assert.equal(float64[0], 0xcb);
    assert.equal(float64.readDoubleBE(1), 0.5);
  });

  // uint 8 -- 0xcc
  // uint 16 -- 0xcd
  // uint 32 -- 0xce
  // uint 64 -- 0xcf -- NOT SUPPORTED
  it("cc-cf: uint 8/16/32/64", function() {
    assert.deepEqual(msgpack.encode(0xFF), Buffer([0xcc, 0xFF]));
    assert.deepEqual(msgpack.encode(0xFFFF), Buffer([0xcd, 0xFF, 0xFF]));
    assert.deepEqual(msgpack.encode(0x7FFFFFFF), Buffer([0xce, 0x7F, 0xFF, 0xFF, 0xFF]));
  });

  // int 8 -- 0xd0
  // int 16 -- 0xd1
  // int 32 -- 0xd2
  // int 64 -- 0xd3 -- NOT SUPPORTED
  it("d0-d3: int 8/16/32/64", function() {
    assert.deepEqual(msgpack.encode(-0x80), Buffer([0xd0, 0x80]));
    assert.deepEqual(msgpack.encode(-0x8000), Buffer([0xd1, 0x80, 0x00]));
    assert.deepEqual(msgpack.encode(-0x80000000), Buffer([0xd2, 0x80, 0x00, 0x00, 0x00]));
  });

  // str 8 -- 0xd9
  // str 16 -- 0xda
  // str 32 -- 0xdb
  it("d9-db: str 8/16/32", function() {
    var str, msg, src = "a";
    for (var i = 0; i < 17; i++) src += src;

    str = src.substr(0, 0xFF);
    msg = msgpack.encode(str);
    assert.deepEqual(msg, Buffer.concat([Buffer([0xd9, 0xFF]), Buffer(str)]));

    str = src.substr(0, 0x0100);
    msg = msgpack.encode(str);
    assert.deepEqual(msg, Buffer.concat([Buffer([0xda, 0x01, 0x00]), Buffer(str)]));

    str = src.substr(0, 0xFFFF);
    msg = msgpack.encode(str);
    assert.deepEqual(msg, Buffer.concat([Buffer([0xda, 0xFF, 0xFF]), Buffer(str)]));

    str = src.substr(0, 0x010000);
    msg = msgpack.encode(str);
    assert.deepEqual(msg, Buffer.concat([Buffer([0xdb, 0x00, 0x01, 0x00, 0x00]), Buffer(str)]));
  });

  // negative fixint -- 0xe0 - 0xff
  it("e0-ff: negative fixint", function() {
    assert.deepEqual(msgpack.encode(-1), Buffer([0xFF]));
    assert.deepEqual(msgpack.encode(-32), Buffer([0xE0]));
  });
});
