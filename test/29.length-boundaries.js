var {it} = require("node:test");
var assert = require("node:assert").strict;
var msgpack = require("../index");

it("uses the shortest binary and extension headers at 255 bytes", function() {
  function Payload(bytes) {
    this.bytes = bytes;
  }
  var codec = msgpack.createCodec();
  codec.addExtPacker(0x40, Payload, function(value) { return value.bytes; });
  [254, 255, 256].forEach(function(length) {
    var bytes = Buffer.alloc(length, 0x61);
    var binary = msgpack.encode(bytes);
    var extension = msgpack.encode(new Payload(bytes), {codec: codec});
    var short = length <= 255;
    assert.equal(binary[0], short ? 0xc4 : 0xc5);
    assert.equal(extension[0], short ? 0xc7 : 0xc8);
    assert.equal(binary.length, length + (short ? 2 : 3));
    assert.equal(extension.length, length + (short ? 3 : 4));
    assert.deepEqual(Array.from(msgpack.decode(binary)), Array.from(bytes));
    var unpacked = msgpack.decode(extension, {codec: codec});
    assert.equal(unpacked.type, 0x40);
    assert.deepEqual(Array.from(unpacked.buffer), Array.from(bytes));
  });
});
