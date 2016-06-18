#!/usr/bin/env mocha -R spec

var assert = require("assert");
var msgpackJS = "../index";
var isBrowser = ("undefined" !== typeof window);
var msgpack = isBrowser && window.msgpack || require(msgpackJS);
var TITLE = __filename.replace(/^.*\//, "");

var HAS_UINT8ARRAY = ("undefined" !== typeof Uint8Array);

describe(TITLE, function() {
  it("{}", function() {
    var encoded = msgpack.encode(1);
    assert.ok(Buffer.isBuffer(encoded));
    // assert.ok(!ArrayBuffer.isView(encoded));
  });

  var it_Uint8Array = HAS_UINT8ARRAY ? it : it.skip;

  it_Uint8Array("{uint8array: true}", function() {
    var codec = msgpack.createCodec({uint8array: true});
    var options = {codec: codec};

    // small data
    var encoded = msgpack.encode(1, options);
    assert.ok(ArrayBuffer.isView(encoded));
    assert.ok(!Buffer.isBuffer(encoded));

    // bigger data
    var big = new Buffer(8192); // 8KB
    big[big.length - 1] = 99;
    var source = [big, big, big, big, big, big, big, big]; // 64KB
    encoded = msgpack.encode(source, options);
    assert.ok(ArrayBuffer.isView(encoded));
    assert.ok(!Buffer.isBuffer(encoded));
    assert.equal(encoded[encoded.length - 1], 99); // last byte
  });
});
