var {describe, it} = require("node:test");
var assert = require("node:assert").strict;
var msgpack = require("../index");

function binaryKey(bytes, type) {
  var length = bytes.length;
  var header = type === 0xc4 ? [type, length]
    : type === 0xc5 ? [type, 0, length]
    : [type, 0, 0, 0, length];
  return header.concat(bytes);
}

describe("28.bin-map-key.js", function() {
  [false, true].forEach(function(binarraybuffer) {
    [0xc4, 0xc5, 0xc6].forEach(function(type) {
      it("decodes binary object keys as UTF-8: " + type + "/" + binarraybuffer, function() {
        var options = {codec: msgpack.createCodec({binarraybuffer: binarraybuffer})};
        [
          {bytes: [], key: ""},
          {bytes: [116, 121, 112, 101], key: "type"},
          {bytes: [0x61, 0, 0x62], key: "a\u0000b"},
          {bytes: [0xc3, 0xa9, 0xe6, 0x97, 0xa5, 0xf0, 0x9f, 0x98, 0x80], key: "\u00e9\u65e5\ud83d\ude00"}
        ].forEach(function(test) {
          var encoded = [0x81].concat(binaryKey(test.bytes, type), [42]);
          var decoded = msgpack.decode(encoded, options);
          assert.deepEqual(Object.keys(decoded), [test.key]);
          assert.equal(decoded[test.key], 42);
        });
      });
    });
  });

  it("decodes nested binary keys without converting binary values", function() {
    var encoded = [0x81].concat(binaryKey([97], 0xc4), [0x81], binaryKey([98], 0xc5), binaryKey([99], 0xc6));
    var decoded = msgpack.decode(encoded);
    assert.deepEqual(Object.keys(decoded), ["a"]);
    assert.deepEqual(Object.keys(decoded.a), ["b"]);
    assert.deepEqual(Array.prototype.slice.call(decoded.a.b), [99]);
  });

  it("preserves array, extension and ordinary keys", function() {
    var codec = msgpack.createCodec();
    codec.addExtUnpacker(0x40, function() { return [65, 66]; });
    // Keys: array [65, 66], extension returning [65, 66], string, number.
    var encoded = [0x84, 0x92, 65, 66, 1, 0xd4, 0x40, 0, 2, 0xa1, 97, 3, 4, 5];
    assert.deepEqual(msgpack.decode(encoded, {codec: codec}), {"65,66": 2, a: 3, "4": 5});
  });

  it("preserves custom extension key coercion", function() {
    var codec = msgpack.createCodec();
    codec.addExtUnpacker(0x40, function() { return new Uint8Array([65, 66]); });
    codec.addExtUnpacker(0x41, function() { return {toString: function() { return "custom"; }}; });
    var encoded = [0x82, 0xd4, 0x40, 0, 1, 0xd4, 0x41, 0, 2];
    assert.deepEqual(msgpack.decode(encoded, {codec: codec}), {"65,66": 1, custom: 2});
  });

  it("keeps binary keys as binary when usemap is enabled", function() {
    [false, true].forEach(function(binarraybuffer) {
      var options = {codec: msgpack.createCodec({usemap: true, binarraybuffer: binarraybuffer})};
      var encoded = [0x81].concat(binaryKey([97, 98], 0xc4), [42]);
      var decoded = msgpack.decode(encoded, options);
      assert.equal(decoded.size, 1);
      decoded.forEach(function(value, key) {
        assert.equal(value, 42);
        if (binarraybuffer) key = new Uint8Array(key);
        assert.deepEqual(Array.prototype.slice.call(key), [97, 98]);
        assert.notEqual(typeof key, "string");
      });
    });
  });

  it("waits for complete binary keys in a chunked decoder", function() {
    var encoded = [0x81].concat(binaryKey([116, 121, 112, 101], 0xc6), [42]);
    for (var split = 1; split < encoded.length; split++) {
      checkSplit(split);
    }

    function checkSplit(split) {
      var results = [];
      var decoder = new msgpack.Decoder({codec: msgpack.createCodec({binarraybuffer: true})});
      decoder.on("data", function(value) { results.push(value); });
      decoder.decode(encoded.slice(0, split));
      assert.equal(results.length, 0);
      decoder.decode(encoded.slice(split));
      assert.deepEqual(results, [{type: 42}]);
    }
  });
});
