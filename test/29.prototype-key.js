var {it} = require("node:test");
var assert = require("node:assert").strict;
var msgpack = require("../index");

it("round trips a literal __proto__ property without changing the decoded prototype", function() {
  [{}, {codec: msgpack.createCodec({uint8array: true})}].forEach(function(options) {
    var original = JSON.parse('{"__proto__":{"message":"data"},"constructor":2,"toString":3}');
    var decoded = msgpack.decode(msgpack.encode(original, options));
    assert.deepEqual(decoded, original);
    assert.equal(Object.getPrototypeOf(decoded), Object.prototype);
    assert.equal(Object.hasOwn(decoded, "__proto__"), true);
    assert.equal(decoded.message, undefined);
  });
});

it("also handles non-string map keys which coerce to __proto__", function() {
  var input = new Map([[["__proto__"], {message: "data"}]]);
  var encoded = msgpack.encode(input, {codec: msgpack.createCodec({usemap: true})});
  var decoded = msgpack.decode(encoded);
  assert.equal(Object.hasOwn(decoded, "__proto__"), true);
  assert.equal(Object.getPrototypeOf(decoded), Object.prototype);
});
