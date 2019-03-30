#!/usr/bin/env mocha -R spec

var assert = require("assert");
var msgpackJS = "../index";
var isBrowser = ("undefined" !== typeof window);
var msgpack = isBrowser && window.msgpack || require(msgpackJS);
var TITLE = __filename.replace(/^.*\//, "");

function toArray(array) {
    if (array instanceof ArrayBuffer) array = new Uint8Array(array);
    return Array.prototype.slice.call(array);
}

describe(TITLE, function () {
    var options = {codec: msgpack.createCodec({canonical: true})};
    it("canonical (encode)", function () {
        var a = {"b": 1, "a": 2};
        var b = {"a": 2, "b": 1};
        var encoded = msgpack.encode(a, options);
        assert.deepEqual(toArray(encoded), toArray(msgpack.encode(b, options)));
    });

    it("canonical (nested)", function () {
        var a = {"b": 1, "a": {"d": 3, "c": 4}};
        var b = {"a": {"c": 4, "d": 3}, "b": 1};
        var encoded = msgpack.encode(a, options);
        assert.deepEqual(toArray(encoded), toArray(msgpack.encode(b, options)));
    });
});
