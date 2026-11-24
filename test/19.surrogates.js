var {it} = require("node:test");
var assert = require("node:assert").strict;
var msgpack = require("../index");

it("encodes unpaired surrogates consistently in Buffer and Uint8Array modes", function() {
  var options = {codec: msgpack.createCodec({uint8array: true})};
  ["\ud800", "\udc00", "\ud800x", "\udc00x", "\ud800\ud800", "\ud800\udc00", "a\ud800z"].forEach(function(value) {
    var encoded = msgpack.encode(value, options);
    var expected = msgpack.encode(value);
    assert.deepEqual(Array.from(encoded), Array.from(expected), JSON.stringify(value));
    assert.equal(msgpack.decode(encoded), Buffer.from(value).toString());
  });
});
