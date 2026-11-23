var {describe, it} = require("node:test");
var assert = require("node:assert").strict;
var Stream = require("stream");
var concat = require("concat-stream");

var msgpack = require("../index");
var TITLE = "30.stream.js";
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

var encodeall = Buffer.concat(encoded);

// invalid msgpack type
var invalencoded = Buffer.from([0xc1]);

describe(TITLE, function() {

  it("wrap preserves top-level nil followed by false", () => new Promise((resolve, reject) => {
    var decoder = msgpack.createDecodeStream({wrap: true});
    var values = [];
    decoder.on("data", value => values.push(value));
    decoder.on("error", reject);
    decoder.on("end", () => resolve(values));
    decoder.end(Buffer.from([0xc0, 0xc2]));
  }).then(values => assert.deepEqual(values, [{value: null}, {value: false}])));

  it("wrap handles fragmented input and nested nulls", () => new Promise((resolve, reject) => {
    var decoder = msgpack.createDecodeStream({wrap: true});
    var expected = [null, {value: null}, [null], false, null];
    var input = Buffer.concat(expected.map(value => msgpack.encode(value)));
    var values = [];
    decoder.on("data", value => values.push(value));
    decoder.on("error", reject);
    decoder.on("end", () => resolve({values: values, expected: expected}));
    input.forEach(value => decoder.write(Buffer.from([value])));
    decoder.end();
  }).then(result => assert.deepEqual(result.values, result.expected.map(value => ({value: value})))));

  it("wrap encodes envelopes without adding them to the wire format", () => new Promise((resolve, reject) => {
    var encoder = msgpack.createEncodeStream({wrap: true});
    var values = [null, false, {value: null}, [null], 0, "", undefined];
    var chunks = [];
    encoder.on("data", chunk => chunks.push(chunk));
    encoder.on("error", reject);
    encoder.on("end", () => resolve({actual: Buffer.concat(chunks), values: values}));
    values.forEach(value => encoder.write({value: value}));
    encoder.end();
  }).then(result => assert.deepEqual(result.actual, Buffer.concat(result.values.map(value => msgpack.encode(value))))));

  it("wrap round trips nulls and codec values through a pipeline", () => new Promise((resolve, reject) => {
    var codec = msgpack.createCodec({preset: true});
    var expected = [null, new Date(123456789), false];
    var source = Stream.Readable.from(expected.map(value => ({value: value})));
    var values = [];
    var sink = new Stream.Writable({
      objectMode: true,
      write: function(value, encoding, callback) {
        values.push(value);
        callback();
      }
    });
    Stream.pipeline(source, msgpack.createEncodeStream({wrap: true, codec: codec}),
      msgpack.createDecodeStream({wrap: true, codec: codec}), sink, function(error) {
        if (error) return reject(error);
        resolve({values: values, expected: expected});
      });
  }).then(result => assert.deepEqual(result.values, result.expected.map(value => ({value: value})))));

  it("wrap rejects an envelope without its own value property", () => new Promise((resolve, reject) => {
    var encoder = msgpack.createEncodeStream({wrap: true});
    encoder.on("error", resolve);
    encoder.on("finish", () => reject(new Error("invalid envelope was accepted")));
    encoder.resume();
    encoder.end({missing: null});
  }).then(error => {
    assert.ok(error instanceof TypeError);
    assert.match(error.message, /value property/);
  }));

  it("msgpack.createEncodeStream()", () => new Promise((resolve, reject) => {
    var done = (err) => (err ? reject(err) : resolve());
    var encoder = msgpack.createEncodeStream();
    encoder.pipe(concat(onEnd));
    encoder.write(src[0]);
    encoder.write(src[1]);
    encoder.write(src[2]);
    encoder.end();

    function onEnd(data) {
      assert.deepEqual(data, encodeall);
      done();
    }
  }));

  it("msgpack.createDecodeStream()", () => new Promise((resolve, reject) => {
    var done = (err) => (err ? reject(err) : resolve());
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
  }));

  it("pipe(encoder).pipe(decoder)", () => new Promise((resolve, reject) => {
    var done = (err) => (err ? reject(err) : resolve());
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
  }));

  it("pipe(decoder).pipe(encoder)", () => new Promise((resolve, reject) => {
    var done = (err) => (err ? reject(err) : resolve());
    var inputStream = new Stream.PassThrough();
    var decoder = msgpack.createDecodeStream();
    var passThrough = new Stream.PassThrough({objectMode: true});
    var encoder = msgpack.createEncodeStream();

    inputStream.pipe(decoder).pipe(passThrough).pipe(encoder).pipe(concat(onEnd));
    inputStream.write(encoded[0]);
    inputStream.write(encoded[1]);
    inputStream.write(encoded[2]);
    inputStream.end();

    function onEnd(data) {
      assert.deepEqual(data, encodeall);
      done();
    }
  }));

  it("write()", () => new Promise((resolve, reject) => {
    var done = (err) => (err ? reject(err) : resolve());
    var count = 0;
    var buf = msgpack.encode(example);
    var decoder = msgpack.createDecodeStream();
    decoder.on("data", onData);

    for (var i = 0; i < 3; i++) {
      Array.prototype.forEach.call(buf, each);
    }

    // decode stream should be closed
    decoder.end();

    // write a single byte into the decode stream
    function each(x) {
      decoder.write(Buffer.from([x]));
    }

    function onData(data) {
      assert.deepEqual(data, example);
      if (++count === 3) done();
    }
  }));

  it("msgpack.createDecodeStream().on('error',fn)", () => new Promise((resolve, reject) => {
    var done = (err) => (err ? reject(err) : resolve());
    var decoder = msgpack.createDecodeStream();

    decoder.on("error", function(e) {
      if (!(e instanceof Error)) return done(new Error("should be an error"));
      if (!/Invalid type/.test(e.message)) return done(new Error("unexpected: " + e.message));
      done();
    });

    decoder.on("data", function() {
      // throwing here would be captured by the try/catch under test
      done(new Error("should not emit data"));
    });

    decoder.end(invalencoded);
  }));

  it("msgpack.createEncodeStream().on('error',fn)", () => new Promise((resolve, reject) => {
    var done = (err) => (err ? reject(err) : resolve());
    var circular = [];
    circular.push(circular);

    // the error event should carry what the synchronous API throws
    var expected;
    try {
      msgpack.encode(circular);
    } catch (e) {
      expected = e;
    }
    assert.ok(expected instanceof Error, "encode() should throw for circular references");

    var encoder = msgpack.createEncodeStream();

    encoder.on("error", function(e) {
      if (!(e instanceof Error)) return done(new Error("should be an error"));
      if (e.name !== expected.name) return done(new Error("unexpected: " + e.name));
      done();
    });

    // partial output is flushed as the internal buffer overflows
    encoder.resume();

    encoder.end(circular);
  }));

});
