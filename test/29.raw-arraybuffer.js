var {it} = require("node:test");
var assert = require("node:assert").strict;
var msgpack = require("../index");

it("encodes ArrayBuffers as raw bytes when both binary options are enabled", function() {
  var options = {codec: msgpack.createCodec({useraw: true, binarraybuffer: true})};
  var rawOptions = {codec: msgpack.createCodec({useraw: true})};
  [0, 1, 31, 32, 255, 256, 2049].forEach(function(length) {
    var value = new Uint8Array(length);
    value.fill(0x61);
    var encoded = msgpack.encode(value.buffer, options);
    var expected = msgpack.encode(Buffer.from(value), rawOptions);
    assert.deepEqual(Array.from(encoded), Array.from(expected));
    assert.deepEqual(new Uint8Array(msgpack.decode(encoded, options)), value);
  });
});
