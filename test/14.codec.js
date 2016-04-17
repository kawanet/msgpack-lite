#!/usr/bin/env mocha -R spec

var assert = require("assert");
var msgpackJS = "../index";
var isBrowser = ("undefined" !== typeof window);
var msgpack = isBrowser && window.msgpack || require(msgpackJS);
var TITLE = __filename.replace(/^.*\//, "");

describe(TITLE, function() {
  it("createCodec()", function() {
    var codec = msgpack.createCodec();
    var options = {codec: codec};
    assert.ok(codec);

    // this codec does not have preset codec
    for (var i = 0; i < 256; i++) {
      test(i);
    }

    function test(type) {
      // fixext 1 -- 0xd4
      var source = new Buffer([0xd4, type, type]);
      var decoded = msgpack.decode(source, options);
      assert.equal(decoded.type, type);
      assert.equal(decoded.buffer.length, 1);
      var encoded = msgpack.encode(decoded, options);
      assert.deepEqual(encoded, source);
    }
  });

  it("addExtPacker()", function() {
    var codec = msgpack.createCodec();
    codec.addExtPacker(0, MyClass, myClassPacker);
    codec.addExtUnpacker(0, myClassUnpacker);
    var options = {codec: codec};
    [0, 1, 127, 255].forEach(test);

    function test(type) {
      var source = new MyClass(type);
      var encoded = msgpack.encode(source, options);
      var decoded = msgpack.decode(encoded, options);
      assert.ok(decoded instanceof MyClass);
      assert.equal(decoded.value, type);
    }
  });
});

function MyClass(value) {
  this.value = value & 0xFF;
}

function myClassPacker(obj) {
  return new Buffer([obj.value]);
}

function myClassUnpacker(buffer) {
  return new MyClass(buffer[0]);
}
