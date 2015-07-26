#!/usr/bin/env mocha -R spec

var assert = require("assert");
var Stream = require("stream");

var msgpackJS = "../index";
var isBrowser = ("undefined" !== typeof window);
var msgpack = isBrowser && window.msgpack || require(msgpackJS);
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

  it("msgpack.createEncodeStream()", function(done) {
    var inputStream = new Stream.PassThrough({objectMode: true});
    var outputStream = new Stream.PassThrough();
    var count = 0;
    
    outputStream.on("data", onData);

    var encoder = msgpack.createEncodeStream();
    inputStream.pipe(encoder).pipe(outputStream);

    inputStream.write(src[0]);
    inputStream.write(src[1]);
    inputStream.write(src[2]);
    inputStream.end();

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
});
