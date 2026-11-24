var {describe, it} = require("node:test");
var assert = require("node:assert").strict;
var msgpack = require("../index");
var TITLE = "14.codec.js";

var HAS_UINT8ARRAY = ("undefined" !== typeof Uint8Array);

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
      var source = Buffer.from([0xd4, type, type]);
      var decoded = msgpack.decode(source, options);
      assert.equal(decoded.type, type);
      assert.equal(decoded.buffer.length, 1);
      var encoded = msgpack.encode(decoded, options);
      assert.deepEqual(toArray(encoded), toArray(source));
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

  // The safe mode works as same as the default mode. It'd be hard for test it.
  it("createCodec({safe: true})", function() {
    var options = {codec: msgpack.createCodec({safe: true})};
    var source = 1;
    var encoded = msgpack.encode(source, options);
    var decoded = msgpack.decode(encoded, options);
    assert.equal(decoded, source);
  });

  it("createCodec({preset: true})", function() {
    var options1 = {codec: msgpack.createCodec({preset: true})};
    var options2 = {codec: msgpack.createCodec({preset: false})};

    var source = new Date();
    var encoded = msgpack.encode(source, options1);
    assert.equal(encoded[0], 0xC7, "preset ext format failure. (128 means map format)"); // ext 8
    assert.equal(encoded[1], 0x09); // 1+8
    assert.equal(encoded[2], 0x0D); // Date

    // decode as Boolean instance
    var decoded = msgpack.decode(encoded, options1);
    assert.equal(decoded - 0, source - 0);
    assert.ok(decoded instanceof Date);

    // decode as ExtBuffer
    decoded = msgpack.decode(encoded, options2);
    assert.ok(!(decoded instanceof Date));
    assert.equal(decoded.type, 0x0D);
  });
});

[
  ["source", msgpack],
  ["bundle", require("../dist/msgpack.min")]
].forEach(function(variant) {
  var api = variant[1];
  describe("extension constructor identity (" + variant[0] + ")", function() {
    it("keeps different constructors with the same name independent", function() {
      var First = messageConstructor();
      var Second = messageConstructor();
      var codec = api.createCodec();
      registerMessage(codec, 0x40, First);
      registerMessage(codec, 0x41, Second);

      assertMessageRoundTrip(api, codec, First, 0x40, 17);
      assertMessageRoundTrip(api, codec, Second, 0x41, 23);
    });

    it("replaces only the re-registered constructor's packer", function() {
      var First = messageConstructor();
      var Second = messageConstructor();
      var codec = api.createCodec();
      registerMessage(codec, 0x40, First);
      registerMessage(codec, 0x41, Second);
      registerMessage(codec, 0x42, First);

      assertMessageRoundTrip(api, codec, First, 0x42, 31);
      assertMessageRoundTrip(api, codec, Second, 0x41, 37);

      registerMessage(codec, 0x43, Second);
      assertMessageRoundTrip(api, codec, First, 0x42, 41);
      assertMessageRoundTrip(api, codec, Second, 0x43, 43);
    });

    it("keeps a preset constructor when a custom constructor has the same name", function() {
      var CustomDate = function Date(value) { this.value = value; };
      var codec = api.createCodec({preset: true});
      registerMessage(codec, 0x40, CustomDate);

      var options = {codec: codec};
      var decoded = api.decode(api.encode(new Date(12345), options), options);
      assert.ok(decoded instanceof Date);
      assert.equal(Number(decoded), 12345);
      assertMessageRoundTrip(api, codec, CustomDate, 0x40, 47);
    });

    ["", "Object"].forEach(function(name) {
      it("supports a fallback constructor named " + JSON.stringify(name), function() {
        var Class = messageConstructor();
        Object.defineProperty(Class, "name", {value: name});
        var codec = api.createCodec();
        registerMessage(codec, 0x40, Class);
        assertMessageRoundTrip(api, codec, Class, 0x40, 53);
      });
    });

  });
});

function messageConstructor() {
  return function Message(value) { this.value = value; };
}

function registerMessage(codec, type, Class) {
  codec.addExtPacker(type, Class, function(value) { return Buffer.from([value.value]); });
  codec.addExtUnpacker(type, function(buffer) { return new Class(buffer[0]); });
}

function assertMessageRoundTrip(api, codec, Class, type, value) {
  var options = {codec: codec};
  var encoded = api.encode(new Class(value), options);
  assert.deepEqual(toArray(encoded), [0xD4, type, value]);
  var decoded = api.decode(encoded, options);
  assert.ok(decoded instanceof Class);
  assert.equal(decoded.value, value);
}

function MyClass(value) {
  this.value = value & 0xFF;
}

function myClassPacker(obj) {
  return Buffer.from([obj.value]);
}

function myClassUnpacker(buffer) {
  return new MyClass(buffer[0]);
}

function toArray(array) {
  if (HAS_UINT8ARRAY && array instanceof ArrayBuffer) array = new Uint8Array(array);
  return Array.prototype.slice.call(array);
}
