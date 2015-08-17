#!/usr/bin/env mocha -R spec

/*jshint -W053 */

var assert = require("assert");

var msgpackJS = "../index";
var isBrowser = ("undefined" !== typeof window);
var msgpack = isBrowser && window.msgpack || require(msgpackJS);
var TITLE = __filename.replace(/^.*\//, "") + ":";
var FUNCTION_HAS_NAME = NOP.name;

describe(TITLE, function() {
  var skip = FUNCTION_HAS_NAME ? it : it.skip;
  skip("Boolean", function() {
    [true, false].forEach(function(value) {
      var source = new Boolean(value);
      assert.equal(source - 0, value - 0);
      var encoded = msgpack.encode(source);
      var decoded = msgpack.decode(encoded);
      assert.equal(decoded - 0, source - 0);
      assert.ok(decoded instanceof Boolean);
    });
  });

  skip("Date", function() {
    var source = new Date();
    var encoded = msgpack.encode(source);
    var decoded = msgpack.decode(encoded);
    assert.equal(decoded - 0, source - 0);
    assert.ok(decoded instanceof Date);
  });

  var ERROR_TYPES = ["Error", "EvalError", "RangeError", "ReferenceError", "SyntaxError", "TypeError", "URIError"];
  ERROR_TYPES.forEach(function(name, idx) {
    var Class = global[name];
    var skip = FUNCTION_HAS_NAME && Class ? it : it.skip;
    skip(name, function() {
      var message = "foo:" + idx;
      var source = new Class(message);
      var encoded = msgpack.encode(source);
      var decoded = msgpack.decode(encoded);
      assert.equal(decoded + "", source + "");
      assert.equal(decoded.name, name);
      assert.equal(decoded.message, message);
      assert.ok(decoded instanceof Error);
    });
  });

  skip("RegExp", function() {
    var source = new RegExp("foo");
    var encoded = msgpack.encode(source);
    var decoded = msgpack.decode(encoded);
    assert.equal(decoded + "", source + "");
    assert.ok(decoded instanceof RegExp);
  });

  skip("RegExp //g", function() {
    var source = /bar/g;
    var encoded = msgpack.encode(source);
    var decoded = msgpack.decode(encoded);
    assert.equal(decoded + "", source + "");
    assert.ok(decoded instanceof RegExp);
  });

  skip("Number", function() {
    var source = new Number(123.456);
    var encoded = msgpack.encode(source);
    var decoded = msgpack.decode(encoded);
    assert.equal(decoded - 0, source - 0);
    assert.ok(decoded instanceof Number);
  });

  skip("String", function() {
    var source = new String("qux");
    var encoded = msgpack.encode(source);
    var decoded = msgpack.decode(encoded);
    assert.equal(decoded + "", source + "");
    assert.ok(decoded instanceof String);
  });

  it("ExtBuffer", function() {
    for (var type = 32; type < 256; type++) {
      // fixext 8 -- 0xd7
      var header = new Buffer([0xd7, type]);
      var content = new Buffer(8);
      for (var i = 0; i < 8; i++) {
        content[i] = (type + i) & 0x7F;
      }
      var source = Buffer.concat([header, content]);
      var decoded = msgpack.decode(source);
      var encoded = msgpack.encode(decoded);
      assert.deepEqual(encoded, source);
    }
  });
});

function NOP() {
}