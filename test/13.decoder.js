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
});
