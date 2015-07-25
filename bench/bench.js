#!/usr/bin/env node

var msgpack_lite = require("../index");
var msgpack5 = require("msgpack5")();
var msgpack_node = require("msgpack");
var msgpack_js = require("msgpack-js");
var data = require("./example");

var count = 1000;

var ret;
ret = bench('JSON.stringify()                ', JSON.stringify, data);
ret = bench('JSON.parse()                    ', JSON.parse, ret);
test(ret, data);

ret = bench('require("msgpack").pack()       ', msgpack_node.pack, data);
ret = bench('require("msgpack").unpack()     ', msgpack_node.unpack, ret);
test(ret, data);

ret = bench('require("msgpack-lite").encode()', msgpack_lite.encode, data);
ret = bench('require("msgpack-lite").decode()', msgpack_lite.decode, ret);
test(ret, data);

ret = bench('require("msgpack-js").encode()  ', msgpack_js.encode, data);
ret = bench('require("msgpack-js").decode()  ', msgpack_js.decode, ret);
test(ret, data);

ret = bench('require("msgpack5")().encode()  ', msgpack5.encode, data);
ret = bench('require("msgpack5")().decode()  ', msgpack5.decode, ret);
test(ret, data);

function bench(name, func, src) {
  var start = new Date() - 0;
  var ret;
  for (var i = 0; i < count; i++) {
    ret = func(src)
  }
  var end = new Date() - 0;
  console.warn(name, end - start);
  return ret;
}

function test(actual, expected) {
  actual = JSON.stringify(actual);
  expected = JSON.stringify(expected);
  if (actual === expected) return;
  console.warn("expected: " + expected);
  console.warn("actual:   " + actual);
}
