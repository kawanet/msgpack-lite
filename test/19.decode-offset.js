var {describe, it} = require("node:test");
var assert = require("node:assert").strict;
var msgpack = require("../index");

describe("decodeWithOffset", function() {
  [Buffer.from, Array.from, Uint8Array.from.bind(Uint8Array)].forEach(function(from, index) {
    describe(["Buffer", "Array", "Uint8Array"][index], function() {
      it("reports UTF-8 bytes consumed without decoding trailing data", function() {
        var input = from([0xa3, 0xe9, 0x9b, 0xaa, 0xc1]);
        var before = Array.from(input);
        assert.deepEqual(msgpack.decodeWithOffset(input), {value: "\u96ea", bytesRead: 4});
        assert.deepEqual(Array.from(input), before);
        assert.equal(msgpack.decode(input), "\u96ea");
      });

      it("locates the next concatenated value", function() {
        var input = from([0x81, 0xa1, 0x61, 0x01, 0x92, 0xc2, 0xc0]);
        var first = msgpack.decodeWithOffset(input);
        assert.deepEqual(first, {value: {a: 1}, bytesRead: 4});
        assert.deepEqual(msgpack.decodeWithOffset(input.slice(first.bytesRead)),
          {value: [false, null], bytesRead: 3});
      });

      it("reports one consumed byte for nil and false", function() {
        assert.deepEqual(msgpack.decodeWithOffset(from([0xc0])), {value: null, bytesRead: 1});
        assert.deepEqual(msgpack.decodeWithOffset(from([0xc2])), {value: false, bytesRead: 1});
      });

      it("rejects empty, incomplete and invalid first values", function() {
        assert.throws(() => msgpack.decodeWithOffset(from([])), /BUFFER_SHORTAGE/);
        assert.throws(() => msgpack.decodeWithOffset(from([0xa3, 0x61])), /BUFFER_SHORTAGE/);
        assert.throws(() => msgpack.decodeWithOffset(from([0xc1])), /Invalid type/);
      });
    });
  });

  it("measures offsets relative to Buffer and Uint8Array views", function() {
    var bytes = [0xff, 0xa1, 0x61, 0xc2, 0xff];
    [Buffer.from(bytes), new Uint8Array(bytes)].forEach(function(input) {
      var view = input.subarray(1, 4);
      assert.deepEqual(msgpack.decodeWithOffset(view), {value: "a", bytesRead: 2});
      assert.deepEqual(Array.from(input), bytes);
    });
  });

  it("uses the requested codec", function() {
    var options = {codec: msgpack.createCodec({usemap: true, preset: true})};
    var value = new Map([["date", new Date(12345)]]);
    var encoded = msgpack.encode(value, options);
    var input = Buffer.concat([encoded, Buffer.from([0xc1])]);
    var result = msgpack.decodeWithOffset(input, options);
    assert.deepEqual(result.value, value);
    assert.equal(result.bytesRead, encoded.length);
  });
});
