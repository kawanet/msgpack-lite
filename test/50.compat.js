#!/usr/bin/env mocha -R spec

var assert = require("assert").strict;

var msgpack = require("../index");
var TITLE = "50.compat.js";

var data = require("./example.json");

describe(TITLE, function() {
  // Use the top level pack/unpack. A Packr instance defaults to the record
  // extension, which packs repeated object shapes into a custom ext type
  // that no other implementation reads back.
  test("msgpackr", function(they) {
    assert.deepEqual(they.unpack(msgpack.encode(data)), data);
    assert.deepEqual(msgpack.decode(Buffer.from(they.pack(data))), data);
  });

  test("@msgpack/msgpack", function(they) {
    assert.deepEqual(they.decode(msgpack.encode(data)), data);
    assert.deepEqual(msgpack.decode(Buffer.from(they.encode(data))), data);
  });

  test("msgpack5", function(they) {
    they = they();
    assert.deepEqual(they.decode(msgpack.encode(data)), data);
    assert.deepEqual(msgpack.decode(Buffer.from(they.encode(data))), data);
  });

  test("notepack.io", function(they) {
    assert.deepEqual(they.decode(msgpack.encode(data)), data);
    assert.deepEqual(msgpack.decode(Buffer.from(they.encode(data))), data);
  });
});

function test(name, func) {
  var they;
  var method = it;
  try {
    they = require(name);
  } catch (e) {
    method = it.skip;
    name += ": " + e;
  }
  method(name, func.bind(null, they));
}
