#!/usr/bin/env node

var msgpack_node = require("msgpack");
var msgpack_lite = require("../index");
var msgpack_js = require("msgpack-js");
var msgpack_js_v5 = require("msgpack-js-v5");
var msgpack5 = require("msgpack5")();
var msgpack_unpack = require("msgpack-unpack");
var msgpack_codec = require("msgpack-javascript").msgpack;

var pkg = require("../package.json");
var data = require("../test/example");
var packed = msgpack_lite.encode(data);
var expected = JSON.stringify(data);

var argv = Array.prototype.slice.call(process.argv, 2);

if (argv[0] === "-v") {
  console.warn(pkg.name + " " + pkg.version);
  process.exit(0);
}

var limit = 5;
if (argv[0] - 0) limit = argv.shift() - 0;
limit *= 1000;

var COL1 = 62;
var COL2 = 10 + (Math.log(limit) / Math.LN10) * 2;

console.log(pad("operation", COL1), "|", pad("result", COL2), "|", "op/s");
console.log(pad("", COL1, "-"), "|", pad("", COL2, "-"), "|", "-----");

var buf, obj;

buf = bench('buf = Buffer(JSON.stringify(obj));                       ', JSON_stringify, data);
obj = bench('obj = JSON.parse(buf);                                   ', JSON.parse, buf);
test(obj);

buf = bench('buf = require("msgpack").pack(obj);         ', msgpack_node.pack, data);
obj = bench('obj = require("msgpack").unpack(buf);       ', msgpack_node.unpack, buf);
test(obj);

buf = bench('buf = require("msgpack-lite").encode(obj);  ', msgpack_lite.encode, data);
obj = bench('obj = require("msgpack-lite").decode(buf);  ', msgpack_lite.decode, packed);
test(obj);

buf = bench('buf = Buffer(require("msgpack-javascript").msgpack.pack(obj));', msgpack_codec_pack, data);
obj = bench('obj = require("msgpack-javascript").msgpack.unpack(buf);      ', msgpack_codec.unpack, buf);
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

function msgpack_codec_pack(data) {
  return Buffer(msgpack_codec.pack(data));
}

function bench(name, func, src) {
  if (argv.length) {
    var match = argv.filter(function(grep) {
      return (name.indexOf(grep) > -1);
    });
    if (!match.length) return SKIP;
  }
  var ret, duration;
  var start = new Date() - 0;
  var count = 0;
  while (1) {
    var end = new Date() - 0;
    duration = end - start;
    if (duration >= limit) break;
    while ((++count) % 100) ret = func(src);
  }
  name = pad(name, COL1);
  var score = Math.floor(count / duration * 100);
  var col = count + "op" + " / " + duration + "ms";
  col = pad(col, COL2);
  console.log(name, "|", col, "|", score);
  return ret;
}

function pad(str, len, chr) {
  if (!chr) chr = " ";
  while (str.length < len) str += chr;
  return str;
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
