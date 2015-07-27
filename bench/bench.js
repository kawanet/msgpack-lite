#!/usr/bin/env node

var msgpack_node = require("msgpack");
var msgpack_lite = require("../index");
var msgpack_js = require("msgpack-js");
var msgpack_js_v5 = require("msgpack-js-v5");
var msgpack5 = require("msgpack5")();
var msgpack_unpack = require("msgpack-unpack");

var data = require("../test/example");
var packed = msgpack_lite.encode(data);
var expected = JSON.stringify(data);

var argv = Array.prototype.slice.call(process.argv, 2);

var limit = 5;
if (argv[0] - 0) limit = argv.shift() - 0;
limit *= 1000;

var grep;
if (argv[0]) grep = argv.shift();

console.log("operation                                   ", "|", "result            ", "|", "op/ms");
console.log("--------------------------------------------", "|", "------------------", "|", "-----");

var buf, obj;

buf = bench('buf = Buffer(JSON.stringify(obj));          ', JSON_stringify, data);
obj = bench('obj = JSON.parse(buf);                      ', JSON.parse, buf);
test(obj);

buf = bench('buf = require("msgpack").pack(obj);         ', msgpack_node.pack, data);
obj = bench('obj = require("msgpack").unpack(buf);       ', msgpack_node.unpack, buf);
test(obj);

buf = bench('buf = require("msgpack-lite").encode(obj);  ', msgpack_lite.encode, data);
obj = bench('obj = require("msgpack-lite").decode(buf);  ', msgpack_lite.decode, packed);
test(obj);

buf = bench('buf = require("msgpack-js-v5").encode(obj); ', msgpack_js_v5.encode, data);
obj = bench('obj = require("msgpack-js-v5").decode(buf); ', msgpack_js_v5.decode, buf);
test(obj);

buf = bench('buf = require("msgpack-js").encode(obj);    ', msgpack_js.encode, data);
obj = bench('obj = require("msgpack-js").decode(buf);    ', msgpack_js.decode, buf);
test(obj);

buf = bench('buf = require("msgpack5")().encode(obj);    ', msgpack5.encode, data);
obj = bench('obj = require("msgpack5")().decode(buf);    ', msgpack5.decode, buf);
test(obj);

obj = bench('obj = require("msgpack-unpack").decode(buf);', msgpack_unpack, packed);
test(obj);

function JSON_stringify(src) {
  return Buffer(JSON.stringify(src));
}

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
  var col = count + "op" + " / " + duration + "ms";
  col += "                  ".substr(0, 18 - col.length);
  console.log(name, "|", col, "|", score);
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