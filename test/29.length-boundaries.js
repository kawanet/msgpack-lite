var {it} = require("node:test");
var assert = require("node:assert").strict;
var msgpack = require("../index");
var ExtBuffer = require("../lib/ext-buffer").ExtBuffer;

it("uses the shortest binary and extension headers at 255 bytes", function() {
  [254, 255, 256].forEach(function(length) {
    var bytes = Buffer.alloc(length, 0x61);
    var binary = msgpack.encode(bytes);
    var extension = msgpack.encode(new ExtBuffer(bytes, 0x40));
    var short = length <= 255;
    assert.equal(binary[0], short ? 0xc4 : 0xc5);
    assert.equal(extension[0], short ? 0xc7 : 0xc8);
    assert.equal(binary.length, length + (short ? 2 : 3));
    assert.equal(extension.length, length + (short ? 3 : 4));
    assert.deepEqual(msgpack.decode(binary), bytes);
    assert.deepEqual(msgpack.decode(extension).buffer, bytes);
  });
});
