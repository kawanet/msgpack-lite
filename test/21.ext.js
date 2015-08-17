#!/usr/bin/env mocha -R spec

/*jshint -W053 */

var assert = require("assert");

var msgpackJS = "../index";
var isBrowser = ("undefined" !== typeof window);
var msgpack = isBrowser && window.msgpack || require(msgpackJS);
var TITLE = __filename.replace(/^.*\//, "") + ":";

describe(TITLE, function() {
  it("Date", function() {
    var source = new Date();
    var encoded = msgpack.encode(source);
    var decoded = msgpack.decode(encoded);
    assert.equal(decoded - 0, source - 0);
    assert.ok(decoded instanceof Date);
  });

  it("Error", function() {
    var source = new Error("baz");
    var encoded = msgpack.encode(source);
    var decoded = msgpack.decode(encoded);
    assert.equal(decoded + "", source + "");
    assert.equal(decoded.name, source.name);
    assert.equal(decoded.message, source.message);
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
