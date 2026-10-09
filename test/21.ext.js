/*jshint -W053 */

var {describe, it} = require("node:test");
var assert = require("node:assert").strict;
var msgpack = require("../index");
var TITLE = "21.ext.js";

describe(TITLE, function() {
  it("Boolean", function() {
    [true, false].forEach(function(value) {
      var source = new Boolean(value);
      assert.equal(source - 0, value - 0);
      var encoded = msgpack.encode(source);
      assert.equal(encoded[0], 0xD4, "preset ext format failure. (128 means map format)"); // fixext 1
      assert.equal(encoded[1], 0x0B); // Boolean
      var decoded = msgpack.decode(encoded);
      assert.equal(decoded - 0, source - 0);
      assert.ok(decoded instanceof Boolean);
    });
  });

  it("Date", function() {
    var source = new Date();
    var encoded = msgpack.encode(source);
    assert.equal(encoded[0], 0xC7, "preset ext format failure. (128 means map format)"); // ext 8
    assert.equal(encoded[1], 0x09); // 1+8
    assert.equal(encoded[2], 0x0D); // Date
    var decoded = msgpack.decode(encoded);
    assert.equal(decoded - 0, source - 0);
    assert.ok(decoded instanceof Date);
  });

  var ERROR_TYPES = ["Error", "EvalError", "RangeError", "ReferenceError", "SyntaxError", "TypeError", "URIError"];
  ERROR_TYPES.forEach(function(name, idx) {
    var Class = global[name];
    it(name, function() {
      var message = "foo:" + idx;
      var source = new Class(message);
      var encoded = msgpack.encode(source);
      var decoded = msgpack.decode(encoded);
      assert.equal(decoded + "", source + "");
      assert.equal(decoded.name, name);
      assert.equal(decoded.message, message);
      assert.ok(decoded instanceof Class);
    });
  });

  it("RegExp", function() {
    var source = new RegExp("foo");
    var encoded = msgpack.encode(source);
    var decoded = msgpack.decode(encoded);
    assert.equal(decoded + "", source + "");
    assert.ok(decoded instanceof RegExp);
  });

  it("RegExp //g", function() {
    var source = /foo\/bar/g;
    var encoded = msgpack.encode(source);
    var decoded = msgpack.decode(encoded);
    assert.equal(decoded + "", source + "");
    assert.ok(decoded instanceof RegExp);
  });

  it("Number", function() {
    var source = new Number(123.456);
    var encoded = msgpack.encode(source);
    assert.equal(encoded[0], 0xC7); // ext 8
    assert.equal(encoded[1], 0x09); // 1+8
    assert.equal(encoded[2], 0x0F); // Number
    var decoded = msgpack.decode(encoded);
    assert.equal(decoded - 0, source - 0);
    assert.ok(decoded instanceof Number);
  });

  it("String", function() {
    var source = new String("qux");
    var encoded = msgpack.encode(source);
    var decoded = msgpack.decode(encoded);
    assert.equal(decoded + "", source + "");
    assert.ok(decoded instanceof String);
  });
});
