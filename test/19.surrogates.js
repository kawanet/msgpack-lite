var {it} = require("node:test");
var assert = require("node:assert").strict;
var msgpack = require("../index");

it("replaces unpaired surrogates without consuming following characters", function() {
  var options = {codec: msgpack.createCodec({uint8array: true})};
  [
    ["\ud800", "\ufffd"],
    ["\udc00", "\ufffd"],
    ["\ud800x", "\ufffdx"],
    ["\udc00x", "\ufffdx"],
    ["\ud800\ud800", "\ufffd\ufffd"],
    ["\ud800\udc00", "\ud800\udc00"],
    ["a\ud800z", "a\ufffdz"]
  ].forEach(function(pair) {
    var value = pair[0];
    var encoded = msgpack.encode(value, options);
    var expected = msgpack.encode(pair[1]);
    assert.deepEqual(Array.from(encoded), Array.from(expected), JSON.stringify(value));
    assert.equal(msgpack.decode(encoded), pair[1]);
  });
});
