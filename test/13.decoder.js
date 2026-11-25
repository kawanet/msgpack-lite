var {describe, it} = require("node:test");
var assert = require("node:assert").strict;
var msgpack = require("../index");
var TITLE = "13.decoder.js";

var source = {"foo": "bar"};
var packed = msgpack.encode(source);

describe(TITLE, function() {

  it("Decoder().decode(obj)", () => new Promise((resolve, reject) => {
    var decoder = new msgpack.Decoder();
    decoder.on("data", function(data) {
      assert.deepEqual(data, source);
    });
    decoder.on("end", resolve);
    decoder.on("error", reject);
    decoder.decode(packed);
    decoder.end();
  }));

  it("Decoder().end(obj)", () => new Promise((resolve, reject) => {
    var decoder = new msgpack.Decoder();
    decoder.on("data", function(data) {
      assert.deepEqual(data, source);
    });
    decoder.on("end", resolve);
    decoder.on("error", reject);
    decoder.end(packed);
  }));

  it("propagates falsy exceptions from extension unpackers", function() {
    var input = Buffer.from([0xd4, 0x40, 0x01]);
    [false, 0, "", null, undefined, NaN].forEach(function(reason) {
      var codec = msgpack.createCodec();
      codec.addExtUnpacker(0x40, function() { throw reason; });
      var options = {codec: codec};
      var matches = function(error) { return Object.is(error, reason); };

      assert.throws(function() { msgpack.decode(input, options); }, matches);
      var decoder = new msgpack.Decoder(options);
      assert.throws(function() { decoder.decode(input); }, matches);
    });
  });

  it("still waits for a complete extension payload", function() {
    var codec = msgpack.createCodec();
    codec.addExtUnpacker(0x40, function(buffer) { return buffer[0]; });
    var decoder = new msgpack.Decoder({codec: codec});
    var values = [];
    decoder.on("data", function(value) { values.push(value); });

    decoder.decode(Buffer.from([0xd4, 0x40]));
    assert.deepEqual(values, []);
    decoder.decode(Buffer.from([0x01]));
    assert.deepEqual(values, [1]);
  });
});
