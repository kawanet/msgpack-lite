#!/usr/bin/env mocha -R spec

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
});
