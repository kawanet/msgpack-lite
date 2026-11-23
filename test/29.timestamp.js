var {describe, it} = require("node:test");
var assert = require("node:assert").strict;
var standard = require("@msgpack/msgpack");
var msgpack = require("../index");
var options = {codec: msgpack.createCodec({timestamp: true})};

describe("MessagePack timestamp extension", function() {
  var vectors = [
    [0, "d6ff00000000"],
    [1000, "d6ff00000001"],
    [4294967295000, "d6ffffffffff"],
    [4294967296000, "d7ff0000000100000000"],
    [1001, "d7ff003d090000000001"],
    [-1000, "c70cff00000000ffffffffffffffff"],
    [-1, "c70cff3b8b87c0ffffffffffffffff"],
    [17179869184000, "c70cff000000000000000400000000"]
  ];
  vectors.forEach(function(pair) {
    it("encodes and decodes wire vector " + pair[0], function() {
      var bytes = Buffer.from(pair[1], "hex");
      assert.equal(Buffer.from(msgpack.encode(new Date(pair[0]), options)).toString("hex"), pair[1]);
      assert.equal(msgpack.decode(bytes, options).getTime(), pair[0]);
      assert.equal(msgpack.decode(bytes).type, 0xff);
    });
  });

  [false, true].forEach(function(uint8array) {
    it("interoperates in both directions, uint8array=" + uint8array, function() {
      var codec = msgpack.createCodec({timestamp: true, uint8array: uint8array});
      [-8640000000000000, -1234567890123, -999, 999, 1234567890123, 17179869183999,
        8640000000000000].forEach(function(ms) {
        var value = {dates: [new Date(ms)]};
        assert.equal(standard.decode(msgpack.encode(value, {codec: codec})).dates[0].getTime(), ms);
        assert.equal(msgpack.decode(standard.encode(value), {codec: codec}).dates[0].getTime(), ms);
      });
    });
  });

  it("retains legacy Date encoding and can combine timestamps with other presets", function() {
    assert.equal(msgpack.encode(new Date(0))[1], 0x0D);
    var codec = msgpack.createCodec({preset: true, timestamp: true});
    var value = [new Date(-1), /test/gi];
    var decoded = msgpack.decode(msgpack.encode(value, {codec: codec}), {codec: codec});
    assert.equal(decoded[0].getTime(), -1);
    assert.equal(decoded[1].toString(), "/test/gi");
    assert.equal(msgpack.decode(msgpack.encode(new Date(-1)), {codec: codec}).getTime(), -1);
  });

  it("preserves custom extension overrides", function() {
    var codec = msgpack.createCodec({timestamp: true});
    codec.addExtUnpacker(255, function() { return "custom"; });
    assert.equal(msgpack.decode(Buffer.from("d6ff00000000", "hex"), {codec: codec}), "custom");
  });

  it("rejects invalid dates and malformed timestamp payloads", function() {
    assert.throws(function() { msgpack.encode(new Date(NaN), options); }, RangeError);
    ["d4ff00", "d5ff0000", "d7ffee6b280000000000",
      "c70cff3b9aca000000000000000000", "c70cff000000007fffffffffffffff"].forEach(function(hex) {
      assert.throws(function() { msgpack.decode(Buffer.from(hex, "hex"), options); }, RangeError);
    });
  });

  it("uses Date's millisecond precision for timestamps with nanoseconds", function() {
    // One nanosecond after the epoch and one nanosecond before it.
    ["d7ff0000000400000000", "c70cff3b9ac9ffffffffffffffffff"].forEach(function(hex) {
      var bytes = Buffer.from(hex, "hex");
      assert.equal(msgpack.decode(bytes, options).getTime(), standard.decode(bytes).getTime());
    });
  });

  it("decodes timestamps when input arrives one byte at a time", function() {
    var decoder = new msgpack.Decoder(options);
    var values = [];
    decoder.on("data", function(value) { values.push(value.getTime()); });
    vectors.forEach(function(pair) {
      var bytes = Buffer.from(pair[1], "hex");
      for (var i = 0; i < bytes.length; i++) decoder.decode(bytes.slice(i, i + 1));
    });
    assert.deepEqual(values, vectors.map(function(pair) { return pair[0]; }));
  });
});
