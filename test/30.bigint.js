/*global BigInt, BigInt64Array, BigUint64Array */
var {describe, it} = require("node:test");
var assert = require("node:assert").strict;
var msgpack = require("../index");
var reference = require("@msgpack/msgpack");
var Int64Buffer = require("int64-buffer");

var vectors = [
  ["0", "cf0000000000000000"],
  ["127", "cf000000000000007f"],
  ["4294967296", "cf0000000100000000"],
  ["9007199254740993", "cf0020000000000001"],
  ["9223372036854775807", "cf7fffffffffffffff"],
  ["9223372036854775808", "cf8000000000000000"],
  ["18446744073709551615", "cfffffffffffffffff"],
  ["-1", "d3ffffffffffffffff"],
  ["-129", "d3ffffffffffffff7f"],
  ["-9007199254740993", "d3ffdfffffffffffff"],
  ["-9223372036854775808", "d38000000000000000"]
];

describe("BigInt integers", function() {
  vectors.forEach(function(vector) {
    it("encodes exact standard wire bytes for " + vector[0], function() {
      var value = BigInt(vector[0]);
      [{bigint: true}, {bigint: true, safe: true}, {bigint: true, uint8array: true}].forEach(function(settings) {
        var options = {codec: msgpack.createCodec(settings)};
        var encoded = msgpack.encode(value, options);
        assert.equal(Buffer.from(encoded).toString("hex"), vector[1]);
        assert.equal(msgpack.decode(encoded, options), value);
        assert.equal(reference.decode(encoded, {useBigInt64: true}), value);
        assert.equal(msgpack.decode(reference.encode(value, {useBigInt64: true}), options), value);
      });
      assert.equal(Buffer.from(msgpack.encode(value)).toString("hex"), vector[1]);
    });
  });

  it("rejects values that would overflow instead of silently wrapping", function() {
    ["18446744073709551616", "-9223372036854775809", "123456789012345678901234567890"].forEach(function(value) {
      assert.throws(function() { msgpack.encode(BigInt(value)); }, RangeError);
    });
  });

  it("retains Number and int64-buffer defaults, and gives bigint explicit precedence", function() {
    var encoded = msgpack.encode(BigInt("9007199254740993"));
    assert.equal(typeof msgpack.decode(encoded), "number");
    var int64 = msgpack.decode(encoded, {codec: msgpack.createCodec({int64: true})});
    assert.ok(Int64Buffer.Uint64BE.isUint64BE(int64));
    assert.equal(int64.toString(), "9007199254740993");
    var options = {codec: msgpack.createCodec({bigint: true, int64: true})};
    assert.equal(msgpack.decode(encoded, options), BigInt("9007199254740993"));
    assert.equal(msgpack.decode(msgpack.encode(1), options), 1);
    assert.equal(msgpack.decode(msgpack.encode(-1), options), -1);
    assert.equal(msgpack.decode(msgpack.encode(1.5), options), 1.5);
  });

  it("decodes signed positive and unsigned high-bit wire values correctly", function() {
    var options = {codec: msgpack.createCodec({bigint: true})};
    assert.equal(msgpack.decode(Buffer.from("d37fffffffffffffff", "hex"), options), BigInt("9223372036854775807"));
    assert.equal(msgpack.decode(Buffer.from("cf8000000000000000", "hex"), options), BigInt("9223372036854775808"));
  });

  it("supports byte-at-a-time streaming and mixed Number/BigInt values", function() {
    var options = {codec: msgpack.createCodec({bigint: true})};
    var decoder = new msgpack.Decoder(options);
    var values = [];
    decoder.on("data", function(value) { values.push(value); });
    vectors.forEach(function(vector) {
      var bytes = Buffer.from(vector[1], "hex");
      for (var i = 0; i < bytes.length; i++) decoder.decode(bytes.subarray(i, i + 1));
    });
    decoder.decode(msgpack.encode([BigInt(1), 1, {value: BigInt(-1)}]));
    decoder.end();
    assert.deepEqual(values.slice(0, vectors.length), vectors.map(function(vector) { return BigInt(vector[0]); }));
    assert.deepEqual(values[vectors.length], [BigInt(1), 1, {value: BigInt(-1)}]);
  });

  it("preserves BigInt Map keys", function() {
    var options = {codec: msgpack.createCodec({usemap: true, bigint: true})};
    var value = new Map([[BigInt(1), "big"], [1, "number"]]);
    assert.deepEqual(msgpack.decode(msgpack.encode(value, options), options), value);
  });

  it("preserves values through Node encode/decode streams", function() {
    return new Promise(function(resolve, reject) {
      var options = {codec: msgpack.createCodec({bigint: true})};
      var encoder = msgpack.createEncodeStream(options);
      var decoder = msgpack.createDecodeStream(options);
      var values = [];
      encoder.on("error", reject);
      decoder.on("error", reject);
      decoder.on("data", function(value) { values.push(value); });
      decoder.on("end", function() {
        try {
          assert.deepEqual(values, [[BigInt("18446744073709551615"), BigInt(-1)]]);
          resolve();
        } catch (error) { reject(error); }
      });
      encoder.pipe(decoder);
      encoder.end([BigInt("18446744073709551615"), BigInt(-1)]);
    });
  });
});

describe("64-bit BigInt array extensions", function() {
  [[BigInt64Array, 0x1e, "-9223372036854775808"],
   [BigUint64Array, 0x1f, "18446744073709551615"]].forEach(function(spec) {
    it("round-trips " + spec[0].name + " subviews and empty arrays", function() {
      var Class = spec[0];
      var full = new Class([BigInt(77), BigInt(spec[2]), BigInt(1), BigInt(88)]);
      [undefined, {codec: msgpack.createCodec({preset: true, uint8array: true})},
       {codec: msgpack.createCodec({preset: true, binarraybuffer: true})}].forEach(function(options) {
        [full.subarray(1, 3), new Class(0)].forEach(function(value) {
          var encoded = msgpack.encode(value, options);
          assert.equal(encoded[value.length ? 1 : 2], spec[1]);
          var decoded = msgpack.decode(encoded, options);
          assert.ok(decoded instanceof Class);
          assert.deepEqual(Array.from(decoded), Array.from(value));
          assert.equal(decoded.byteLength, value.byteLength);
          if (decoded.length) decoded[0] = BigInt(9);
          assert.equal(full[1], BigInt(spec[2]), "decoding does not alias caller-owned storage");
        });
      });
    });
    it("rejects malformed " + spec[0].name + " payload lengths", function() {
      assert.throws(function() { msgpack.decode(Buffer.from([0xc7, 1, spec[1], 0])); }, RangeError);
    });
  });
});
