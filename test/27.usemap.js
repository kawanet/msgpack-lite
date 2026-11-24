var {describe, it} = require("node:test");
var assert = require("node:assert").strict;
var HAS_MAP = ("undefined" !== typeof Map);
var msgpack = require("../index");
var TITLE = "27.usemap.js";

function pattern(min, max, offset) {
  var array = [];
  var check = {};
  var val = min - 1;
  while (val <= max) {
    if (min <= val && !check[val]) array.push(val);
    check[val++] = 1;
    if (val <= max && !check[val]) array.push(val);
    check[val++] = 1;
    if (val <= max && !check[val]) array.push(val);
    check[val--] = 1;
    val = val ? val * 2 - 1 : 1;
  }
  return array;
}

// Run these tests when Map is available
var describeSkip = HAS_MAP ? describe : describe.skip;

describeSkip(TITLE, function() {

  ["add", "delete", "clear"].forEach(function(action) {
    it("keeps map framing when a value getter performs " + action, function() {
      var map = new Map();
      var value = {};
      Object.defineProperty(value, "value", {
        enumerable: true,
        get: function() {
          if (action === "add") map.set("added", 3);
          if (action === "delete") map.delete("second");
          if (action === "clear") map.clear();
          return 1;
        }
      });
      map.set("first", value);
      map.set("second", 2);
      var options = {codec: msgpack.createCodec({usemap: true})};
      var encoded = msgpack.encode([map, 42], options);
      var decoded = msgpack.decode(encoded, options);
      assert.deepEqual(decoded, [new Map([
        ["first", new Map([["value", 1]])], ["second", 2]
      ]), 42]);
    });
  });

  it("Map with preset typed arrays", function() {
    var codec = msgpack.createCodec({usemap: true, preset: true});
    var value = new Map([["bytes", new Uint8Array([1, 2, 3])]]);
    var encoded = msgpack.encode(value, {codec: codec});
    var decoded = msgpack.decode(encoded, {codec: codec});
    assert.equal(true, decoded instanceof Map);
    assert.equal(true, decoded.get("bytes") instanceof Uint8Array);
    assert.deepEqual(decoded.get("bytes"), value.get("bytes"));
  });

  it("Map (small)", function() {
    pattern(0, 257).forEach(function(length) {
      var value = new Map();
      assert.equal(true, value instanceof Map);
      for (var i = 0; i < length; i++) {
        var key = String.fromCharCode(i);
        value.set(key, length);
      }
      assert.equal(value.size, length);
      var options = {codec: msgpack.createCodec({usemap: true})};
      var encoded = msgpack.encode(value, options);
      var decoded = msgpack.decode(encoded, options);
      assert.equal(true, decoded instanceof Map);
      assert.equal(decoded.size, length);
      assert.equal(decoded.get(String.fromCharCode(0)), value.get(String.fromCharCode(0)));
      assert.equal(decoded.get(String.fromCharCode(length - 1)), value.get(String.fromCharCode(length - 1)));
    });
  });

  it("Map (large)", {timeout: 30000}, function () {
    pattern(65536, 65537).forEach(function(length) {
      var value = new Map();
      for (var i = 0; i < length; i++) {
        value.set(i, length);
      }
      assert.equal(value.size, length);
      var options = {codec: msgpack.createCodec({usemap: true})};
      var encoded = msgpack.encode(value, options);
      var decoded = msgpack.decode(encoded, options);
      assert.equal(decoded.size, length);
      assert.equal(decoded.get(0), value.get(0));
      assert.equal(decoded.get(length - 1), value.get(length - 1));
    });
  });
});
