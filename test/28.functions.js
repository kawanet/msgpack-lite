#!/usr/bin/env mocha -R spec

var assert = require("assert");
var msgpackJS = "../index";
var isBrowser = ("undefined" !== typeof window);
var msgpack = isBrowser && window.msgpack || require(msgpackJS);
var TITLE = __filename.replace(/^.*\//, "");
var obj = {func: function() {}};

describe(TITLE, function() {
  it("functions: false", function() {
    var options = {codec: msgpack.createCodec({functions: false})};

    // as default
    assert.deepEqual(msgpack.decode(msgpack.encode(obj)), {});

    // explicit
    assert.deepEqual(msgpack.decode(msgpack.encode(obj, options)), {});
  });

  it("functions: true", function() {
    var options = {codec: msgpack.createCodec({functions: true})};

    assert.deepEqual(msgpack.decode(msgpack.encode(obj, options)), {"func": null});
  });
});
