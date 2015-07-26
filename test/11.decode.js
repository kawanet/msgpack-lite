#!/usr/bin/env mocha -R spec

var assert = require("assert");

var msgpackJS = "../index";
var isBrowser = ("undefined" !== typeof window);
var msgpack = isBrowser && window.msgpack || require(msgpackJS);
var TITLE = __filename.replace(/^.*\//, "") + ":";

describe(TITLE, function() {

  // positive fixint -- 0x00 - 0x7f
  it("00-7f: positive fixint", function() {
    assert.deepEqual(msgpack.decode(Buffer([0x00])), 0);
    assert.deepEqual(msgpack.decode(Buffer([0x7F])), 0x7F);
  });

  // fixmap -- 0x80 - 0x8f
  it("80-8f: fixmap", function() {
    assert.deepEqual(msgpack.decode(Buffer([0x80])), {});

    var map = {a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9, j: 10, k: 11, l: 12, m: 13, n: 14, o: 15};
    var array = [0x8F];
    Object.keys(map).forEach(function(key) {
      array.push(0xa1, key.charCodeAt(0), map[key]);
    });
    assert.deepEqual(msgpack.decode(Buffer(array)), map);
  });

  // fixarray -- 0x90 - 0x9f
  it("90-9f: fixarray", function() {
    assert.deepEqual(msgpack.decode(Buffer([0x90])), []);

    var array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
    var buf = Buffer.concat([Buffer([0x9F]), Buffer(array)]);
    assert.deepEqual(msgpack.decode(buf), array);
  });

  // fixstr -- 0xa0 - 0xbf
  it("a0-bf: fixstr", function() {
    assert.deepEqual(msgpack.decode(Buffer([0xa0])), "");

    var str = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
    var buf = Buffer.concat([Buffer([0xBF]), Buffer(str)]);
    assert.deepEqual(msgpack.decode(buf), str);
  });

  // nil -- 0xc0
  it("c0: nil", function() {
    assert.deepEqual(msgpack.decode(Buffer([0xc0])), null);
  });

  // false -- 0xc2
  // true -- 0xc3
  it("c2-c3: boolean", function() {
    assert.equal(msgpack.decode(Buffer([0xc2])), false);
    assert.equal(msgpack.decode(Buffer([0xc3])), true);
  });

  // bin 8 -- 0xc4
  // bin 16 -- 0xc5
  // bin 32 -- 0xc6
  it("c4-c6: bin 8/16/32", function() {
    var bin, buf;

    bin = Buffer(1);
    buf = Buffer.concat([Buffer([0xc4, 1]), bin]);
    assert.deepEqual(msgpack.decode(buf), bin);

    bin = Buffer(256);
    buf = Buffer.concat([Buffer([0xc5, 1, 0]), bin]);
    assert.deepEqual(msgpack.decode(buf), bin);

    bin = Buffer(65536);
    buf = Buffer.concat([Buffer([0xc6, 0, 1, 0, 0]), bin]);
    assert.deepEqual(msgpack.decode(buf), bin);
  });

  // ext 8 -- 0xc7
  // ext 16 -- 0xc8
  // ext 32 -- 0xc9
  it("c7-c9: ext 8/16/32", function() {
    var ext, buf;

    ext = Buffer(1 + 1);
    buf = Buffer.concat([Buffer([0xc7, 1]), ext]);
    assert.deepEqual(msgpack.decode(buf), ext);

    ext = Buffer(1 + 256);
    buf = Buffer.concat([Buffer([0xc8, 1, 0]), ext]);
    assert.deepEqual(msgpack.decode(buf), ext);

    ext = Buffer(1 + 65536);
    buf = Buffer.concat([Buffer([0xc9, 0, 1, 0, 0]), ext]);
    assert.deepEqual(msgpack.decode(buf), ext);
  });

  // float 32 -- 0xca
  // float 64 -- 0xcb
  it("ca-cb: float 32/64", function() {
    var buf;

    buf = Buffer(5);
    buf.writeUInt8(0xCA, 0);
    buf.writeFloatBE(0.5, 1);
    assert.deepEqual(msgpack.decode(buf), 0.5);

    buf = Buffer(9);
    buf.writeUInt8(0xCB, 0);
    buf.writeDoubleBE(0.5, 1);
    assert.deepEqual(msgpack.decode(buf), 0.5);
  });

  // uint 8 -- 0xcc
  // uint 16 -- 0xcd
  // uint 32 -- 0xce
  // uint 64 -- 0xcf -- NOT SUPPORTED
  it("cc-cf: uint 8/16/32/64", function() {
    assert.deepEqual(msgpack.decode(Buffer([0xcc, 0xFF])), 0xFF);
    assert.deepEqual(msgpack.decode(Buffer([0xcd, 0xFF, 0xFF])), 0xFFFF);
    assert.deepEqual(msgpack.decode(Buffer([0xce, 0x7F, 0xFF, 0xFF, 0xFF])), 0x7FFFFFFF);
  });

  // int 8 -- 0xd0
  // int 16 -- 0xd1
  // int 32 -- 0xd2
  // int 64 -- 0xd3 -- NOT SUPPORTED
  it("d0-d3: int 8/16/32/64", function() {
    assert.deepEqual(msgpack.decode(Buffer([0xd0, 0x80])), -0x80);
    assert.deepEqual(msgpack.decode(Buffer([0xd1, 0x80, 0x00])), -0x8000);
    assert.deepEqual(msgpack.decode(Buffer([0xd2, 0x80, 0x00, 0x00, 0x00])), -0x80000000);
  });

  // ext 1 -- 0xd4
  // ext 2 -- 0xd5
  // ext 4 -- 0xd6
  // ext 8 -- 0xd7
  // ext 16 -- 0xd8
  it("d4-d8: ext 1/2/4/8/16", function() {
    var ext, buf;

    ext = Buffer(1 + 1);
    buf = Buffer.concat([Buffer([0xd4]), ext]);
    assert.deepEqual(msgpack.decode(buf), ext);

    ext = Buffer(1 + 2);
    buf = Buffer.concat([Buffer([0xd5]), ext]);
    assert.deepEqual(msgpack.decode(buf), ext);

    ext = Buffer(1 + 4);
    buf = Buffer.concat([Buffer([0xd6]), ext]);
    assert.deepEqual(msgpack.decode(buf), ext);

    ext = Buffer(1 + 8);
    buf = Buffer.concat([Buffer([0xd7]), ext]);
    assert.deepEqual(msgpack.decode(buf), ext);

    ext = Buffer(1 + 16);
    buf = Buffer.concat([Buffer([0xd8]), ext]);
    assert.deepEqual(msgpack.decode(buf), ext);
  });

  // str 8 -- 0xd9
  // str 16 -- 0xda
  // str 32 -- 0xdb
  it("d9-db: str 8/16/32", function() {
    var str, buf, src = "a";
    for (var i = 0; i < 17; i++) src += src;

    str = src.substr(0, 0xFF);
    buf = Buffer.concat([Buffer([0xd9, 0xFF]), Buffer(str)]);
    assert.deepEqual(msgpack.decode(buf), str);

    str = src.substr(0, 0x0100);
    buf = Buffer.concat([Buffer([0xda, 0x01, 0x00]), Buffer(str)]);
    assert.deepEqual(msgpack.decode(buf), str);

    str = src.substr(0, 0xFFFF);
    buf = Buffer.concat([Buffer([0xda, 0xFF, 0xFF]), Buffer(str)]);
    assert.deepEqual(msgpack.decode(buf), str);

    str = src.substr(0, 0x010000);
    buf = Buffer.concat([Buffer([0xdb, 0x00, 0x01, 0x00, 0x00]), Buffer(str)]);
    assert.deepEqual(msgpack.decode(buf), str);
  });

  // negative fixint -- 0xe0 - 0xff
  it("e0-ff: negative fixint", function() {
    assert.deepEqual(msgpack.decode(Buffer([0xFF])), -1);
    assert.deepEqual(msgpack.decode(Buffer([0xE0])), -32);
  });
});
