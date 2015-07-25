#!/usr/bin/env node

var msgpack_node = require("msgpack");
var msgpack_lite = require("../index");
var msgpack_js = require("msgpack-js");
var msgpack5 = require("msgpack5")();
var msgpack_unpack = require("msgpack-unpack");

var data = require("./example");

var biggest = 100000;
var bigger = 10000;
var smaller = 1000;

var ret;
var packed;

ret = bench('JSON.stringify()                  ', JSON.stringify, data, biggest);
ret = bench('JSON.parse()                      ', JSON.parse, ret, biggest);
test(ret, data);

ret = bench('require("msgpack").pack()         ', msgpack_node.pack, data, biggest);
ret = bench('require("msgpack").unpack()       ', msgpack_node.unpack, ret, biggest);
test(ret, data);

ret = bench('require("msgpack-lite").encode()  ', msgpack_lite.encode, data, bigger);
packed = ret;
ret = bench('require("msgpack-lite").decode()  ', msgpack_lite.decode, ret, bigger);
test(ret, data);

ret = bench('require("msgpack-js").encode()    ', msgpack_js.encode, data, bigger);
ret = bench('require("msgpack-js").decode()    ', msgpack_js.decode, ret, bigger);
test(ret, data);

ret = bench('require("msgpack5")().encode()    ', msgpack5.encode, data, smaller);
ret = bench('require("msgpack5")().decode()    ', msgpack5.decode, ret, smaller);
test(ret, data);

ret = bench('require("msgpack-unpack").decode()', msgpack_unpack, packed, smaller);
test(ret, data);

function bench(name, func, src, count) {
  var start = new Date() - 0;
  var ret;
  for (var i = 0; i < count; i++) {
    ret = func(src)
  }
  var end = new Date() - 0;
  var duration = end - start;
  var score = Math.floor(count / duration * 100);
  console.warn(name, count + "op", "/", duration + "ms", "=", score, "op/ms");
  return ret;
}

function test(actual, expected) {
  actual = JSON.stringify(actual);
  expected = JSON.stringify(expected);
  if (actual === expected) return;
  console.warn("expected: " + expected);
  console.warn("actual:   " + actual);
}
