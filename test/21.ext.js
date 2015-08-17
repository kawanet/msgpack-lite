#!/usr/bin/env mocha -R spec

/*jshint -W053 */

var assert = require("assert");

var msgpackJS = "../index";
var isBrowser = ("undefined" !== typeof window);
var msgpack = isBrowser && window.msgpack || require(msgpackJS);
var TITLE = __filename.replace(/^.*\//, "") + ":";

describe(TITLE, function() {
  it("Boolean", function() {
    [true, false].forEach(function(value) {
      var source = new Boolean(value);
      assert.equal(source - 0, value - 0);
      var encoded = msgpack.encode(source);
      var decoded = msgpack.decode(encoded);
      assert.equal(decoded - 0, source - 0);
      assert.ok(decoded instanceof Boolean);
    });
  });

  it("Date", function() {
    var source = new Date();
    var encoded = msgpack.encode(source);
    var decoded = msgpack.decode(encoded);
    assert.equal(decoded - 0, source - 0);
    assert.ok(decoded instanceof Date);
  });

  var ERROR_TYPES = ["Error", "EvalError", "RangeError", "ReferenceError", "SyntaxError", "TypeError", "URIError"];
  ERROR_TYPES.forEach(function(name, idx) {
    var Class = global[name];
    var message = "foo:" + idx;
    var source = new Class(message);
    var encoded = msgpack.encode(source);
    var decoded = msgpack.decode(encoded);
    assert.equal(decoded + "", source + "");
    assert.equal(decoded.name, name);
    assert.equal(decoded.message, message);
    assert.ok(decoded instanceof Error);
  });

  it("RegExp", function() {
    var source = new RegExp("foo");
    var encoded = msgpack.encode(source);
    var decoded = msgpack.decode(encoded);
    assert.equal(decoded + "", source + "");
    assert.ok(decoded instanceof RegExp);
  });

  it("RegExp //g", function() {
    var source = /bar/g;
    var encoded = msgpack.encode(source);
    var decoded = msgpack.decode(encoded);
    assert.equal(decoded + "", source + "");
    assert.ok(decoded instanceof RegExp);
  });

  it("Number", function() {
    var source = new Number(123.456);
    var encoded = msgpack.encode(source);
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
