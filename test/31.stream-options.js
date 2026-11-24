var {it} = require("node:test");
var assert = require("node:assert").strict;
var msgpack = require("../index");

it("does not modify caller-owned stream options", function() {
  [msgpack.createEncodeStream, msgpack.createDecodeStream].forEach(function(create) {
    var options = {highWaterMark: 3};
    var stream = create(options);
    assert.deepEqual(options, {highWaterMark: 3});
    assert.equal(stream.readableHighWaterMark, 3);
    assert.equal(stream.readableObjectMode, true);
    assert.equal(stream.writableObjectMode, true);
    stream.destroy();
  });
});

function collect(stream, chunks) {
  return new Promise(function(resolve, reject) {
    var values = [];
    stream.on("data", function(value) { values.push(value); });
    stream.on("error", reject);
    stream.on("end", function() { resolve(values); });
    chunks.forEach(function(chunk) { stream.write(chunk); });
    stream.end();
  });
}

it("accepts frozen stream options and preserves the codec", function() {
  var codec = msgpack.createCodec({usemap: true});
  var options = Object.freeze({codec: codec, highWaterMark: 2});
  var value = new Map([["key", 7]]);
  return collect(msgpack.createEncodeStream(options), [value]).then(function(encoded) {
    return collect(msgpack.createDecodeStream(options), [Buffer.concat(encoded)]);
  }).then(function(values) {
    assert.deepEqual(values, [value]);
  });
});
