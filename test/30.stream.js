#!/usr/bin/env mocha -R spec

var assert = require("assert");
var Stream = require("stream");
var msgpack = require("../index");
var TITLE = __filename.replace(/^.*\//, "") + ":";
var example = require("./example.json");

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

  it("msgpack.createEncodeStream()", function(done) {
    var count = 0;
    var encoder = msgpack.createEncodeStream();

    encoder.on("data", onData);
    encoder.write(src[0]);
    encoder.write(src[1]);
    encoder.write(src[2]);
    encoder.end();

    function onData(data) {
      assert.deepEqual(data, encoded[count++]);
      if (count === 3) done();
    }
  });

  it("msgpack.createDecodeStream()", function(done) {
    var count = 0;
    var decoder = msgpack.createDecodeStream();

    decoder.on("data", onData);
    decoder.write(encoded[0]);
    decoder.write(encoded[1]);
    decoder.write(encoded[2]);
    decoder.end();

    function onData(data) {
      assert.deepEqual(data, src[count++]);
      if (count === 3) done();
    }
  });

  it("pipe(encoder).pipe(decoder)", function(done) {
    var count = 0;
    var inputStream = new Stream.PassThrough({objectMode: true});
    var encoder = msgpack.createEncodeStream();
    var passThrough = new Stream.PassThrough();
    var decoder = msgpack.createDecodeStream();
    var outputStream = new Stream.PassThrough({objectMode: true});

    inputStream.pipe(encoder).pipe(passThrough).pipe(decoder).pipe(outputStream);

    outputStream.on("data", onData);
    inputStream.write(src[0]);
    inputStream.write(src[1]);
    inputStream.write(src[2]);
    inputStream.end();

    function onData(data) {
      assert.deepEqual(data, src[count++]);
      if (count === 3) done();
    }
  });

  it("pipe(decoder).pipe(encoder)", function(done) {
    var count = 0;
    var inputStream = new Stream.PassThrough();
    var decoder = msgpack.createDecodeStream();
    var passThrough = new Stream.PassThrough({objectMode: true});
    var encoder = msgpack.createEncodeStream();
    var outputStream = new Stream.PassThrough();

    inputStream.pipe(decoder).pipe(passThrough).pipe(encoder).pipe(outputStream);

    outputStream.on("data", onData);
    inputStream.write(encoded[0]);
    inputStream.write(encoded[1]);
    inputStream.write(encoded[2]);
    inputStream.end();

    function onData(data) {
      assert.deepEqual(data, encoded[count++]);
      if (count === 3) done();
    }
  });

  it("write()", function(done) {
    var count = 0;
    var buf = msgpack.encode(example);
    var decoder = msgpack.createDecodeStream();
    decoder.on("data", onData);

    for (var i = 0; i < 3; i++) {
      Array.prototype.forEach.call(buf, each);
    }

    function each(x) {
      decoder.write(Buffer([x]));
    }

    function onData(data) {
      assert.deepEqual(data, example);
      if (++count === 3) done();
    }
  });
});
