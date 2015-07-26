#!/usr/bin/env node

var msgpack_node = require("msgpack");
var msgpack_lite = require("../index");
var msgpack_js = require("msgpack-js");
var msgpack_js_v5 = require("msgpack-js-v5");
var msgpack5 = require("msgpack5")();
var msgpack_unpack = require("msgpack-unpack");

var data = require("./example");
var packed = msgpack_lite.encode(data);
var expected = JSON.stringify(data);

var argv = Array.prototype.slice.call(process.argv, 2);

var limit = 2;
if (argv[0] - 0) limit = argv.shift() - 0;
limit *= 1000;

var grep;
if (argv[0]) grep = argv.shift();

var ret;

ret = bench('JSON.stringify()                  ', JSON.stringify, data);
ret = bench('JSON.parse()                      ', JSON.parse, ret);
test(ret);

ret = bench('require("msgpack").pack()         ', msgpack_node.pack, data);
ret = bench('require("msgpack").unpack()       ', msgpack_node.unpack, ret);
test(ret);

ret = bench('require("msgpack-lite").encode()  ', msgpack_lite.encode, data);
ret = bench('require("msgpack-lite").decode()  ', msgpack_lite.decode, ret);
test(ret);

ret = bench('require("msgpack-js-v5").encode() ', msgpack_js_v5.encode, data);
ret = bench('require("msgpack-js-v5").decode() ', msgpack_js_v5.decode, ret);
test(ret);

ret = bench('require("msgpack-js").encode()    ', msgpack_js.encode, data);
ret = bench('require("msgpack-js").decode()    ', msgpack_js.decode, ret);
test(ret);

ret = bench('require("msgpack5")().encode()    ', msgpack5.encode, data);
ret = bench('require("msgpack5")().decode()    ', msgpack5.decode, ret);
test(ret);

ret = bench('require("msgpack-unpack").decode()', msgpack_unpack, packed);
test(ret);

function bench(name, func, src) {
  if (grep && name.indexOf(grep) < 0) return SKIP;
  var ret, duration;
  var start = new Date() - 0;
  var count = 0;
  while (1) {
    var end = new Date() - 0;
    duration = end - start;
    if (duration >= limit) break;
    while ((++count) % 100) ret = func(src);
  }
  var score = Math.floor(count / duration * 100);
  console.warn(name, count + "op", "/", duration + "ms", "=", score, "op/ms");
  return ret;
}

function test(actual) {
  if (actual === SKIP) return;
  actual = JSON.stringify(actual);
  if (actual === expected) return;
  console.warn("expected: " + expected);
  console.warn("actual:   " + actual);
}

function SKIP() {
}