// ext-preset.js

var Ext = require("./ext").Ext;

var preset = exports.preset = new Ext();

var encode = require("./encode").encode;
var decode = require("./decode").decode;

var ERROR_COLUMNS = {name: 1, message: 1, stack: 1, columnNumber: 1, fileName: 1, lineNumber: 1};

init();

function init() {
  preset.addExtPacker(0x0E, Error, [packError, encode]);
  preset.addExtPacker(0x01, EvalError, [packError, encode]);
  preset.addExtPacker(0x02, RangeError, [packError, encode]);
  preset.addExtPacker(0x03, ReferenceError, [packError, encode]);
  preset.addExtPacker(0x04, SyntaxError, [packError, encode]);
  preset.addExtPacker(0x05, TypeError, [packError, encode]);
  preset.addExtPacker(0x06, URIError, [packError, encode]);

  preset.addExtUnpacker(0x0E, [decode, unpackError(Error)]);
  preset.addExtUnpacker(0x01, [decode, unpackError(EvalError)]);
  preset.addExtUnpacker(0x02, [decode, unpackError(RangeError)]);
  preset.addExtUnpacker(0x03, [decode, unpackError(ReferenceError)]);
  preset.addExtUnpacker(0x04, [decode, unpackError(SyntaxError)]);
  preset.addExtUnpacker(0x05, [decode, unpackError(TypeError)]);
  preset.addExtUnpacker(0x06, [decode, unpackError(URIError)]);

  preset.addExtPacker(0x0A, RegExp, [packRegExp, encode]);
  preset.addExtPacker(0x0B, Boolean, [packValueOf, encode]);
  preset.addExtPacker(0x0C, String, [packValueOf, encode]);
  preset.addExtPacker(0x0D, Date, [Number, encode]);
  preset.addExtPacker(0x0F, Number, [packValueOf, encode]);

  preset.addExtUnpacker(0x0A, [decode, unpackRegExp]);
  preset.addExtUnpacker(0x0B, [decode, unpackClass(Boolean)]);
  preset.addExtUnpacker(0x0C, [decode, unpackClass(String)]);
  preset.addExtUnpacker(0x0D, [decode, unpackClass(Date)]);
  preset.addExtUnpacker(0x0F, [decode, unpackClass(Number)]);

  if ("undefined" !== typeof Uint8Array) {
    preset.addExtPacker(0x11, Int8Array, packBuffer);
    preset.addExtPacker(0x12, Uint8Array, packBuffer);
    preset.addExtPacker(0x13, Int16Array, packTypedArray);
    preset.addExtPacker(0x14, Uint16Array, packTypedArray);
    preset.addExtPacker(0x15, Int32Array, packTypedArray);
    preset.addExtPacker(0x16, Uint32Array, packTypedArray);
    preset.addExtPacker(0x17, Float32Array, packTypedArray);

    preset.addExtUnpacker(0x11, unpackClass(Int8Array));
    preset.addExtUnpacker(0x12, unpackClass(Uint8Array));
    preset.addExtUnpacker(0x13, [unpackArrayBuffer, unpackClass(Int16Array)]);
    preset.addExtUnpacker(0x14, [unpackArrayBuffer, unpackClass(Uint16Array)]);
    preset.addExtUnpacker(0x15, [unpackArrayBuffer, unpackClass(Int32Array)]);
    preset.addExtUnpacker(0x16, [unpackArrayBuffer, unpackClass(Uint32Array)]);
    preset.addExtUnpacker(0x17, [unpackArrayBuffer, unpackClass(Float32Array)]);

    if ("undefined" !== typeof Float64Array) {
      // PhantomJS/1.9.7 doesn't have Float64Array
      preset.addExtPacker(0x18, Float64Array, packTypedArray);
      preset.addExtUnpacker(0x18, [unpackArrayBuffer, unpackClass(Float64Array)]);
    }

    if ("undefined" !== typeof Uint8ClampedArray) {
      // IE10 doesn't have Uint8ClampedArray
      preset.addExtPacker(0x19, Uint8ClampedArray, packBuffer);
      preset.addExtUnpacker(0x19, unpackClass(Uint8ClampedArray));
    }

    preset.addExtPacker(0x1A, ArrayBuffer, packArrayBuffer);
    preset.addExtPacker(0x1D, DataView, packTypedArray);
    preset.addExtUnpacker(0x1A, unpackArrayBuffer);
    preset.addExtUnpacker(0x1D, [unpackArrayBuffer, unpackClass(DataView)]);
  }
}

function packBuffer(value) {
  return new Buffer(value);
}

function packValueOf(value) {
  return (value).valueOf();
}

function packRegExp(value) {
  value = RegExp.prototype.toString.call(value).split("/");
  value.shift();
  var out = [value.pop()];
  out.unshift(value.join("/"));
  return out;
}

function unpackRegExp(value) {
  return RegExp.apply(null, value);
}

function packError(value) {
  var out = {};
  for (var key in ERROR_COLUMNS) {
    out[key] = value[key];
  }
  return out;
}

function unpackError(Class) {
  return function(value) {
    var out = new Class();
    for (var key in ERROR_COLUMNS) {
      out[key] = value[key];
    }
    return out;
  };
}

function unpackClass(Class) {
  return function(value) {
    return new Class(value);
  };
}

function packTypedArray(value) {
  return new Buffer(new Uint8Array(value.buffer));
}

function packArrayBuffer(value) {
  return new Buffer(new Uint8Array(value));
}

function unpackArrayBuffer(value) {
  return (new Uint8Array(value)).buffer;
}
