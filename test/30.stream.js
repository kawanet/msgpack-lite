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

  it("msgpack.encode(object, stream)", function(done) {
    var outputStream = new Stream.PassThrough();
    var count = 0;
    outputStream.on("data", onData);

    msgpack.encode(src[0], outputStream);
    msgpack.encode(src[1], outputStream);
    msgpack.encode(src[2], outputStream);

    function onData(data) {
      assert.deepEqual(data, encoded[count]);
      data = msgpack.decode(data);
      if (count === 0) assert.equal(data[0], "foo");
      if (count === 1) assert.equal(data[0], "bar");
      if (count === 2) assert.equal(data[0], "baz");
      count++;
      if (count === 3) done();
    }
  });

  it("msgpack.decode(buffer, stream)", function(done) {
    var outputStream = new Stream.PassThrough({objectMode: true});
    var count = 0;
    outputStream.on("data", onData);

    msgpack.decode(encoded[0], outputStream);
    msgpack.decode(encoded[1], outputStream);
    msgpack.decode(encoded[2], outputStream);

    function onData(data) {
      if (count === 0) assert.equal(data[0], "foo");
      if (count === 1) assert.equal(data[0], "bar");
      if (count === 2) assert.equal(data[0], "baz");
      count++;
      if (count === 3) done();
    }
  });

  it("msgpack.decode(stream)", function() {
    var inputStream = new Stream.PassThrough();
    inputStream.end(encoded[0]);
    var data = msgpack.decode(inputStream);
    assert.equal(data[0], "foo");
  });

  it("msgpack.decode(stream, stream)", function(done) {
    var inputStream = new Stream.PassThrough();
    var outputStream = new Stream.PassThrough({objectMode: true});
    var count = 0;
    outputStream.on("data", onData);

    msgpack.decode(inputStream, outputStream);

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
