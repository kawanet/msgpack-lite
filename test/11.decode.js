#!/usr/bin/env mocha -R spec

var assert = require("assert");
var msgpackJS = "../index";
var isBrowser = ("undefined" !== typeof window);
var msgpack = isBrowser && window.msgpack || require(msgpackJS);
var TITLE = __filename.replace(/^.*\//, "") + ":";

describe(TITLE, function() {

  // positive fixint -- 0x00 - 0x7f
  it("00-7f: positive fixint", function() {
    for (var i = 0; i <= 0x7F; i++) {
      assert.deepEqual(msgpack.decode(Buffer([i])), i);
    }
  });

  // fixmap -- 0x80 - 0x8f
  it("80-8f: fixmap", function() {
    var map = {a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9, j: 10, k: 11, l: 12, m: 13, n: 14, o: 15, p: 16};
    var src = [0x80];
    var exp = {};
    Object.keys(map).forEach(function(key) {
      assert.deepEqual(msgpack.decode(Buffer(src)), exp);
      src[0]++;
      src.push(0xa1);
      src.push(key.charCodeAt(0));
      src.push(map[key]);
      exp[key] = map[key];
    });
  });

  // fixarray -- 0x90 - 0x9f
  it("90-9f: fixarray", function() {
    var array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
    var src = [0x90];
    var exp = [];
    for (var i = 0; i < 16; i++) {
      assert.deepEqual(msgpack.decode(Buffer(src)), exp);
      src[0]++;
      src.push(array[i]);
      exp.push(array[i]);
    }
  });

  // fixstr -- 0xa0 - 0xbf
  it("a0-bf: fixstr", function() {
    var str = "0123456789abcdefghijklmnopqrstu";
    var src = [0xa0];
    for (var i = 0; i < 32; i++) {
      var exp = str.substr(0, i);
      assert.deepEqual(msgpack.decode(Buffer(src)), exp);
      src[0]++;
      src.push(str.charCodeAt(i));
    }
  });

  // nil -- 0xc0
  it("c0: nil", function() {
    assert.deepEqual(msgpack.decode(Buffer([0xc0])), null);
  });

  // (never used) -- 0xc1
  it("c1: (never used)", function(done) {
    try {
      msgpack.decode(Buffer([0xc1]));
      done("should throw");
    } catch (e) {
      done();
    }
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
    this.timeout(30000);
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
    this.timeout(30000);
    var ext, buf, act;

    ext = Buffer(1);
    buf = Buffer.concat([Buffer([0xc7, 1, 0]), ext]);
    act = msgpack.decode(buf);
    assert.deepEqual(act.buffer, ext);

    ext = Buffer(256);
    buf = Buffer.concat([Buffer([0xc8, 1, 0, 0]), ext]);
    act = msgpack.decode(buf);
    assert.deepEqual(act.buffer, ext);

    ext = Buffer(65536);
    buf = Buffer.concat([Buffer([0xc9, 0, 1, 0, 0, 0]), ext]);
    act = msgpack.decode(buf);
    assert.deepEqual(act.buffer, ext);
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
  // uint 64 -- 0xcf
  it("cc-cf: uint 8/16/32/64", function() {
    assert.deepEqual(msgpack.decode(Buffer([0xcc, 0x01])), 0x01);
    assert.deepEqual(msgpack.decode(Buffer([0xcc, 0xFF])), 0xFF);
    assert.deepEqual(msgpack.decode(Buffer([0xcd, 0x00, 0x01])), 0x0001);
    assert.deepEqual(msgpack.decode(Buffer([0xcd, 0xFF, 0xFF])), 0xFFFF);
    assert.deepEqual(msgpack.decode(Buffer([0xce, 0x00, 0x00, 0x00, 0x01])), 0x00000001);
    assert.deepEqual(msgpack.decode(Buffer([0xce, 0x7F, 0xFF, 0xFF, 0xFF])), 0x7FFFFFFF);
    assert.deepEqual(msgpack.decode(Buffer([0xce, 0xFF, 0xFF, 0xFF, 0xFF])), 0xFFFFFFFF);
    assert.deepEqual(msgpack.decode(Buffer([0xcf, 0, 0, 0, 0, 0xFF, 0xFF, 0xFF, 0xFF])), 0x00000000FFFFFFFF);
    assert.deepEqual(msgpack.decode(Buffer([0xcf, 0, 0, 0xFF, 0xFF, 0xFF, 0xFF, 0, 0])), 0x0000FFFFFFFF0000);
    assert.deepEqual(msgpack.decode(Buffer([0xcf, 0xFF, 0xFF, 0xFF, 0xFF, 0, 0, 0, 0])), 0xFFFFFFFF00000000);
  });

  // int 8 -- 0xd0
  // int 16 -- 0xd1
  // int 32 -- 0xd2
  // int 64 -- 0xd3
  it("d0-d3: int 8/16/32/64", function() {
    assert.deepEqual(msgpack.decode(Buffer([0xd0, 0x7F])), 0x7F);
    assert.deepEqual(msgpack.decode(Buffer([0xd0, 0x80])), -0x80);
    assert.deepEqual(msgpack.decode(Buffer([0xd0, 0xFF])), -1);
    assert.deepEqual(msgpack.decode(Buffer([0xd1, 0x7F, 0xFF])), 0x7FFF);
    assert.deepEqual(msgpack.decode(Buffer([0xd1, 0x80, 0x00])), -0x8000);
    assert.deepEqual(msgpack.decode(Buffer([0xd1, 0xFF, 0xFF])), -1);
    assert.deepEqual(msgpack.decode(Buffer([0xd2, 0x7F, 0xFF, 0xFF, 0xFF])), 0x7FFFFFFF);
    assert.deepEqual(msgpack.decode(Buffer([0xd2, 0x80, 0x00, 0x00, 0x00])), -0x80000000);
    assert.deepEqual(msgpack.decode(Buffer([0xd2, 0xFF, 0xFF, 0xFF, 0xFF])), -1);
    assert.deepEqual(msgpack.decode(Buffer([0xd3, 0, 0, 0, 0, 0xFF, 0xFF, 0xFF, 0xFF])), 0x00000000FFFFFFFF);
    assert.deepEqual(msgpack.decode(Buffer([0xd3, 0, 0, 0xFF, 0xFF, 0xFF, 0xFF, 0, 0])), 0x0000FFFFFFFF0000);
    assert.deepEqual(msgpack.decode(Buffer([0xd3, 0x7F, 0xFF, 0xFF, 0xFF, 0, 0, 0, 0])), 0x7FFFFFFF00000000);
    assert.deepEqual(msgpack.decode(Buffer([0xd3, 0x80, 0, 0, 0, 0, 0, 0, 0])), -0x8000000000000000);
    assert.deepEqual(msgpack.decode(Buffer([0xd3, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF])), -1);
  });

  // fixext 1 -- 0xd4
  // fixext 2 -- 0xd5
  // fixext 4 -- 0xd6
  // fixext 8 -- 0xd7
  // fixext 16 -- 0xd8
  it("d4-d8: fixext 1/2/4/8/16", function() {
    var ext, buf, act;

    ext = Buffer(1);
    buf = Buffer.concat([Buffer([0xd4, 0]), ext]);
    act = msgpack.decode(buf);
    assert.deepEqual(act.buffer, ext);

    ext = Buffer(2);
    buf = Buffer.concat([Buffer([0xd5, 0]), ext]);
    act = msgpack.decode(buf);
    assert.deepEqual(act.buffer, ext);

    ext = Buffer(4);
    buf = Buffer.concat([Buffer([0xd6, 0]), ext]);
    act = msgpack.decode(buf);
    assert.deepEqual(act.buffer, ext);

    ext = Buffer(8);
    buf = Buffer.concat([Buffer([0xd7, 0]), ext]);
    act = msgpack.decode(buf);
    assert.deepEqual(act.buffer, ext);

    ext = Buffer(16);
    buf = Buffer.concat([Buffer([0xd8, 0]), ext]);
    act = msgpack.decode(buf);
    assert.deepEqual(act.buffer, ext);
  });

  // str 8 -- 0xd9
  // str 16 -- 0xda
  // str 32 -- 0xdb
  it("d9-db: str 8/16/32", function() {
    this.timeout(30000);
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

  // array 16 -- 0xdc
  // array 32 -- 0xdd
  it("dc-dd: array 16/32", function() {
    this.timeout(30000);
    var i, src;
    var array = new Array(256);
    for (i = 0; i < 256; i++) array[i] = i & 0x7F;
    src = [0xdc, 0x01, 0x00].concat(array);
    assert.deepEqual(msgpack.decode(Buffer(src)), array);

    for (i = 0; i < 8; i++) array = array.concat(array);
    src = [0xdd, 0x00, 0x01, 0x00, 0x00].concat(array);
    assert.deepEqual(msgpack.decode(Buffer(src)), array);
  });

  // map 16 -- 0xde
  // map 32 -- 0xdf
  it("de-df: map 16/32", function() {
    this.timeout(30000);
    var i, src, key;
    var map = {};
    var array = [];
    for (i = 0; i < 256; i++) {
      key = i.toString(16);
      if (i < 16) key = "0" + key;
      map[key] = i & 0x7F;
      array.push(0xa2);
      array.push(key.charCodeAt(0));
      array.push(key.charCodeAt(1));
      array.push(i & 0x7F);
    }
    src = [0xde, 0x01, 0x00].concat(array);
    assert.deepEqual(msgpack.decode(Buffer(src)), map);

    for (i = 0; i < 8; i++) array = array.concat(array);
    src = [0xdf, 0x00, 0x01, 0x00, 0x00].concat(array);
    assert.deepEqual(msgpack.decode(Buffer(src)), map);
  });

  // negative fixint -- 0xe0 - 0xff
  it("e0-ff: negative fixint", function() {
    for (var i = -32; i <= -1; i++) {
      assert.deepEqual(msgpack.decode(Buffer([i & 0xFF])), i);
    }
  });
});
