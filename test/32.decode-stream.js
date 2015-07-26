#!/usr/bin/env mocha -R spec

var assert = require("assert");
var Stream = require("stream");

var msgpack = require("../index");
var TITLE = __filename.replace(/^.*\//, "") + ":";

var src = [
  ["foo"],
  ["bar"],
  ["baz"]
];

var encoded = [
  msgpack.encode(src[0]),
  msgpack.encode(src[1]),
  msgpack.encode(src[2])
];

describe(TITLE, function() {

  it("msgpack.createDecodeStream()", function(done) {
    var inputStream = new Stream.PassThrough();
    var outputStream = new Stream.PassThrough({objectMode: true});
    var count = 0;

    outputStream.on("data", onData);

    var decoder = msgpack.createDecodeStream();
    inputStream.pipe(decoder).pipe(outputStream);

    inputStream.write(encoded[0]);
    inputStream.write(encoded[1]);
    inputStream.write(encoded[2]);
    inputStream.end();

    function onData(data) {
      if (count === 0) assert.equal(data[0], "foo");
      if (count === 1) assert.equal(data[0], "bar");
      if (count === 2) assert.equal(data[0], "baz");
      count++;
      if (count === 3) done();
    }
  });
});
