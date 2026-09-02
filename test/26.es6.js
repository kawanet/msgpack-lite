#!/usr/bin/env mocha -R spec

var assert = require("assert").strict;
var msgpack = require("../index");
var TITLE = "26.es6.js";

describe(TITLE, function() {

  var skip = ("undefined" !== typeof Symbol) ? it : it.skip;
  skip("Symbol", function() {
    assert.deepEqual(toArray(msgpack.encode(Symbol("foo"))), [0xc0]);
  });

});

function toArray(buffer) {
  return Array.prototype.slice.call(buffer);
}
