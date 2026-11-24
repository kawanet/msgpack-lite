var {it} = require("node:test");
var assert = require("node:assert").strict;
var msgpack = require("../index");

it("preserves negative zero through numeric round trips", function() {
  [{}, {codec: msgpack.createCodec({uint8array: true})}].forEach(function(options) {
    assert.equal(msgpack.decode(msgpack.encode(-0, options)), -0);
    assert.deepEqual(msgpack.decode(msgpack.encode([-0, 0, 1, -1], options)), [-0, 0, 1, -1]);
    assert.deepEqual(Array.from(msgpack.encode(0, options)), [0]);
  });
});
