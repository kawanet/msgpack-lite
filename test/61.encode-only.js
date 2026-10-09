var {describe, it} = require("node:test");
var assert = require("node:assert").strict;

var encode = require("../lib/encode").encode;
var ExtBuffer = require("../lib/ext-buffer").ExtBuffer;
var TITLE = "61.encode-only.js";

describe(TITLE, function() {
  it("encode", function() {
    // int
    assert.deepEqual(toArray(encode(1)), [1]);

    // str
    assert.deepEqual(toArray(encode("a")), [161, 97]);

    // ExtBuffer
    var ext = new ExtBuffer(Buffer.from([1]), 127);
    assert.ok(ext instanceof ExtBuffer);
    assert.deepEqual(toArray(encode(ext)), [212, 127, 1]);
  });
});

function toArray(buffer) {
  return Array.prototype.slice.call(buffer);
}