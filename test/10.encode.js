#!/usr/bin/env mocha -R spec

var assert = require("assert");

var msgpackJS = "../index";
var isBrowser = ("undefined" !== typeof window);
var msgpack = isBrowser && window.msgpack || require(msgpackJS);
var TITLE = __filename.replace(/^.*\//, "") + ":";

describe(TITLE, function() {

  // positive fixint -- 0x00 - 0x7f
  it("00-7f: positive fixint", function() {
    assert.deepEqual(toArray(msgpack.encode(0x00)), [0x00]);
    assert.deepEqual(toArray(msgpack.encode(0x7F)), [0x7F]);
  });

  // fixmap -- 0x80 - 0x8f
  it("80-8f: fixmap", function() {
    assert.deepEqual(toArray(msgpack.encode({})), [0x80]);

    var map = {a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9, j: 10, k: 11, l: 12, m: 13, n: 14, o: 15};
    var array = [0x8F];
    Object.keys(map).forEach(function(key) {
      array.push(0xa1, key.charCodeAt(0), map[key]);
    });
    assert.deepEqual(toArray(msgpack.encode(map)), array);
  });

  // fixarray -- 0x90 - 0x9f
  it("90-9f: fixarray", function() {
    assert.deepEqual(toArray(msgpack.encode([])), [0x90]);

    var array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
    assert.deepEqual(toArray(msgpack.encode(array)), concat([0x9F], array));
  });

  // fixstr -- 0xa0 - 0xbf
  it("a0-bf: fixstr", function() {
    assert.deepEqual(toArray(msgpack.encode("")), [0xa0]);

    var str = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
    assert.deepEqual(toArray(msgpack.encode(str)), concat([0xBF], Buffer(str)));
  });

  // nil -- 0xc0
  it("c0: nil (null)", function() {
    assert.deepEqual(toArray(msgpack.encode(null)), [0xc0]);
  });
  it("c0: nil (undefined)", function() {
    assert.deepEqual(toArray(msgpack.encode(undefined)), [0xc0]);
  });
  it("c0: nil (Function)", function() {
    assert.deepEqual(toArray(msgpack.encode(NOP)), [0xc0]);
  });

  // false -- 0xc2
  // true -- 0xc3
  it("c2-c3: boolean", function() {
    assert.deepEqual(toArray(msgpack.encode(false)), [0xc2]);
    assert.deepEqual(toArray(msgpack.encode(true)), [0xc3]);
  });

  // bin 8 -- 0xc4
  // bin 16 -- 0xc5
  // bin 32 -- 0xc6
  it("c4-c6: bin 8/16/32", function() {
    var bin;
    bin = Buffer(1);
    bin.fill(0);
    assert.deepEqual(toArray(msgpack.encode(bin)), concat([0xc4, 1], bin));

    bin = Buffer(256);
    bin.fill(0);
    assert.deepEqual(toArray(msgpack.encode(bin)), concat([0xc5, 1, 0], bin));

    bin = Buffer(65536);
    bin.fill(0);
    assert.deepEqual(toArray(msgpack.encode(bin)), concat([0xc6, 0, 1, 0, 0], bin));
  });

  // float 32 -- 0xca -- NOT SUPPORTED
  // float 64 -- 0xcb
  it("ca-cb: float 32/64", function() {
    assert.deepEqual(toArray(msgpack.encode(0.5)), [0xcb, 63, 224, 0, 0, 0, 0, 0, 0]);
  });

  // uint 8 -- 0xcc
  // uint 16 -- 0xcd
  // uint 32 -- 0xce
  // uint 64 -- 0xcf -- NOT SUPPORTED
  it("cc-cf: uint 8/16/32/64", function() {
    assert.deepEqual(toArray(msgpack.encode(0xFF)), [0xcc, 0xFF]);
    assert.deepEqual(toArray(msgpack.encode(0xFFFF)), [0xcd, 0xFF, 0xFF]);
    assert.deepEqual(toArray(msgpack.encode(0x7FFFFFFF)), [0xce, 0x7F, 0xFF, 0xFF, 0xFF]);
  });

  // int 8 -- 0xd0
  // int 16 -- 0xd1
  // int 32 -- 0xd2
  // int 64 -- 0xd3 -- NOT SUPPORTED
  it("d0-d3: int 8/16/32/64", function() {
    assert.deepEqual(toArray(msgpack.encode(-0x80)), [0xd0, 0x80]);
    assert.deepEqual(toArray(msgpack.encode(-0x8000)), [0xd1, 0x80, 0x00]);
    assert.deepEqual(toArray(msgpack.encode(-0x80000000)), [0xd2, 0x80, 0x00, 0x00, 0x00]);
  });

  // str 8 -- 0xd9
  // str 16 -- 0xda
  // str 32 -- 0xdb
  it("d9-db: str 8/16/32", function() {
    this.timeout(10000);
    var str, src = "a";
    for (var i = 0; i < 17; i++) src += src;

    str = src.substr(0, 0xFF);
    assert.deepEqual(toArray(msgpack.encode(str)), concat([0xd9, 0xFF], Buffer(str)));

    str = src.substr(0, 0x0100);
    assert.deepEqual(toArray(msgpack.encode(str)), concat([0xda, 0x01, 0x00], Buffer(str)));

    str = src.substr(0, 0xFFFF);
    assert.deepEqual(toArray(msgpack.encode(str)), concat([0xda, 0xFF, 0xFF], Buffer(str)));

    str = src.substr(0, 0x010000);
    assert.deepEqual(toArray(msgpack.encode(str)), concat([0xdb, 0x00, 0x01, 0x00, 0x00], Buffer(str)));
  });

  // negative fixint -- 0xe0 - 0xff
  it("e0-ff: negative fixint", function() {
    assert.deepEqual(toArray(msgpack.encode(-1)), [0xFF]);
    assert.deepEqual(toArray(msgpack.encode(-32)), [0xE0]);
  });
});

function toArray(buffer) {
  return Array.prototype.slice.call(buffer);
}

function concat(buf) {
  return Array.prototype.concat.apply([], Array.prototype.map.call(arguments, toArray));
}

function NOP() {
}