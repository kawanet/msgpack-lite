var {it} = require("node:test");
var assert = require("node:assert").strict;
var msgpack = require("../index");

function collect(chunks) {
  return new Promise(function(resolve, reject) {
    var decoder = msgpack.createDecodeStream();
    var values = [];
    decoder.on("data", function(value) { values.push(value); });
    decoder.on("error", reject);
    decoder.on("end", function() { resolve(values); });
    chunks.forEach(function(chunk) { decoder.write(chunk); });
    decoder.end();
  });
}

it("rejects a stream ending in an incomplete value", function() {
  var values = ["text", [1, 2], {key: 3}, Buffer.from([1, 2]), 1.5];
  var checks = [];
  for (var value of values) {
    var encoded = msgpack.encode(value);
    for (var cut = 1; cut < encoded.length; cut++) {
      checks.push(assert.rejects(collect([encoded.subarray(0, cut)]), /BUFFER_SHORTAGE/));
    }
  }
  checks.push(assert.rejects(collect([msgpack.encode(1), Buffer.from([0xa2, 0x61])]), /BUFFER_SHORTAGE/));
  return Promise.all(checks);
});

it("accepts complete, empty and byte-by-byte streams", function() {
  var encoded = msgpack.encode({key: "value"});
  var chunks = Array.from(encoded, function(byte) { return Buffer.from([byte]); });
  return Promise.all([collect([]), collect([Buffer.alloc(0)]), collect(chunks)]).then(function(values) {
    assert.deepEqual(values, [[], [], [{key: "value"}]]);
  });
});
