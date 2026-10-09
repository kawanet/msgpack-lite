var {describe, it} = require("node:test");
var assert = require("node:assert").strict;
var msgpack = require("../index");
var TITLE = "12.encoder.js";

var source = {"foo": "bar"};
var packed = toArray(msgpack.encode(source));

describe(TITLE, function() {

  it("Encoder().encode(obj)", () => new Promise((resolve, reject) => {
    var encoder = new msgpack.Encoder();
    encoder.on("data", function(data) {
      assert.deepEqual(toArray(data), packed);
    });
    encoder.on("end", resolve);
    encoder.on("error", reject);
    encoder.encode(source);
    encoder.end();
  }));

  it("Encoder().end(obj)", () => new Promise((resolve, reject) => {
    var encoder = new msgpack.Encoder();
    encoder.on("data", function(data) {
      assert.deepEqual(toArray(data), packed);
    });
    encoder.on("end", resolve);
    encoder.on("error", reject);
    encoder.end(source);
  }));
});

function toArray(buffer) {
  return Array.prototype.slice.call(buffer);
}
