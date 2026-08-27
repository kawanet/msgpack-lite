#!/usr/bin/env mocha -R spec

var assert = require("assert");
var msgpackJS = "../index";
var isBrowser = ("undefined" !== typeof window);
var msgpack = isBrowser && window.msgpack || require(msgpackJS);
var TITLE = __filename.replace(/^.*\//, "");

describe(TITLE, function() {
  // An array32/map32 header may declare up to 2^32-1 elements. Decoding a
  // header whose element count cannot fit in the remaining bytes must fail
  // without first pre-allocating one slot per declared element.
  it("dd: array32 does not pre-allocate for a truncated header", function() {
    // array32 declaring 2^25 elements, no body (5 bytes)
    assertBounded([0xdd, 0x02, 0x00, 0x00, 0x00]);
  });

  it("df: map32 does not pre-allocate for a truncated header", function() {
    // map32 declaring 2^25 entries, no body (5 bytes)
    assertBounded([0xdf, 0x02, 0x00, 0x00, 0x00]);
  });

  it("still decodes a valid array of the same declared length", function() {
    var source = [];
    for (var i = 0; i < 1000; i++) source.push(i);
    assert.deepEqual(msgpack.decode(msgpack.encode(source)), source);
  });
});

function assertBounded(bytes) {
  var attack = Buffer.from(bytes);
  var before = process.memoryUsage().heapUsed;
  assert.throws(function() {
    msgpack.decode(attack);
  });
  var grew = process.memoryUsage().heapUsed - before;
  assert.ok(grew < 64 * 1024 * 1024, "grew " + Math.round(grew / 1048576) + "MB for a " + attack.length + "-byte buffer");
}
