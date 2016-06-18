#!/usr/bin/env mocha -R spec

/*jshint -W053 */

var assert = require("assert");
var msgpackJS = "../index";
var isBrowser = ("undefined" !== typeof window);
var msgpack = isBrowser && window.msgpack || require(msgpackJS);
var TITLE = __filename.replace(/^.*\//, "");

var HAS_UINT8ARRAY = ("undefined" !== typeof Uint8Array);

describe(TITLE, function() {
  it("ExtBuffer (0x00)", function() {
    testExtBuffer(0);
  });

  it("ExtBuffer (0x20-0xFF)", function() {
    for (var i = 32; i < 256; i++) {
      testExtBuffer(i);
    }
  });

  function testExtBuffer(type) {
    // fixext 8 -- 0xd7
    var header = new Buffer([0xd7, type]);
    var content = new Buffer(8);
    for (var i = 0; i < 8; i++) {
      content[i] = (type + i) & 0x7F;
    }
    var source = Buffer.concat([header, content]);
    var decoded = msgpack.decode(source);
    assert.equal(decoded.type, type);
    assert.equal(decoded.buffer.length, content.length);
    assert.deepEqual(toArray(decoded.buffer), toArray(content));
    var encoded = msgpack.encode(decoded);
    assert.deepEqual(toArray(encoded), toArray(source));
  }
});

function toArray(array) {
  if (HAS_UINT8ARRAY && array instanceof ArrayBuffer) array = new Uint8Array(array);
  return Array.prototype.slice.call(array);
}
