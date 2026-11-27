var {describe, it} = require("node:test");
var assert = require("node:assert").strict;
var msgpack = require("../index");
var TITLE = "13.decoder.js";

var source = {"foo": "bar"};
var packed = msgpack.encode(source);

describe(TITLE, function() {

  it("ends without input and emits no values", function() {
    var decoder = new msgpack.Decoder();
    var values = [];
    var ended = 0;
    decoder.on("data", function(value) { values.push(value); });
    decoder.on("end", function() { ended++; });
    decoder.end();
    assert.deepEqual(values, []);
    assert.equal(ended, 1);
  });

  it("allows empty flushes before receiving the first chunk", function() {
    var decoder = new msgpack.Decoder();
    var values = [];
    decoder.on("data", function(value) { values.push(value); });
    decoder.decode();
    decoder.decode();
    assert.deepEqual(values, []);
    decoder.end(packed);
    assert.deepEqual(values, [source]);
  });

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
});
