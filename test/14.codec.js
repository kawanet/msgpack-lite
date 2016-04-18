#!/usr/bin/env mocha -R spec

var assert = require("assert");
var msgpackJS = "../index";
var isBrowser = ("undefined" !== typeof window);
var msgpack = isBrowser && window.msgpack || require(msgpackJS);
var TITLE = __filename.replace(/^.*\//, "");

describe(TITLE, function() {
  var codec;

  it("createCodec()", function() {
    codec = msgpack.createCodec();
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

  it("extend()", function() {
    codec = codec.extend();
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

  // The safe mode works as same as the default mode. It'd be hard for test it.
  it("safe", function() {
    codec = codec.extend({safe: true});
    var options = {codec: codec};
    var source = 1;
    var encoded = msgpack.encode(source, options);
    var decoded = msgpack.decode(encoded, options);
    assert.equal(decoded, source);
  });

  it("preset", function() {
    var options1 = {codec: msgpack.createCodec({preset: true})};
    var options2 = {codec: msgpack.createCodec({preset: false})};
    [true, false].forEach(test);

    function test(bool) {
      /*jshint -W053 */ // Do not use Boolean as a constructor.

      var source = new Boolean(bool);
      var encoded = msgpack.encode(source, options1);
      assert.equal(encoded[0], 0xd4);
      assert.equal(encoded[1], 0x0b);

      // decode as Boolean instance
      var decoded = msgpack.decode(encoded, options1);
      assert.ok(decoded instanceof Boolean);

      // decode as ExtBuffer
      decoded = msgpack.decode(encoded, options2);
      assert.ok(!(decoded instanceof Boolean));
      assert.equal(decoded.type, 0x0b);
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
