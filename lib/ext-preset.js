// ext-preset.js

var Ext = require("./ext").Ext;

var preset = exports.preset = new Ext();

var encode = require("./encode").encode;
var decode = require("./decode").decode;

var ERROR_COLUMNS = {name: 1, message: 1, stack: 1, columnNumber: 1, fileName: 1, lineNumber: 1};

init();

function init() {
  preset.addExtPacker(0x0E, Error, join(packError, encode));
  preset.addExtPacker(0x01, EvalError, join(packError, encode));
  preset.addExtPacker(0x02, RangeError, join(packError, encode));
  preset.addExtPacker(0x03, ReferenceError, join(packError, encode));
  preset.addExtPacker(0x04, SyntaxError, join(packError, encode));
  preset.addExtPacker(0x05, TypeError, join(packError, encode));
  preset.addExtPacker(0x06, URIError, join(packError, encode));

  preset.addExtUnpacker(0x0E, join(decode, unpackError(Error)));
  preset.addExtUnpacker(0x01, join(decode, unpackError(EvalError)));
  preset.addExtUnpacker(0x02, join(decode, unpackError(RangeError)));
  preset.addExtUnpacker(0x03, join(decode, unpackError(ReferenceError)));
  preset.addExtUnpacker(0x04, join(decode, unpackError(SyntaxError)));
  preset.addExtUnpacker(0x05, join(decode, unpackError(TypeError)));
  preset.addExtUnpacker(0x06, join(decode, unpackError(URIError)));

  preset.addExtPacker(0x0A, RegExp, join(packRegExp, encode));
  preset.addExtPacker(0x0B, Boolean, join(packValueOf, encode));
  preset.addExtPacker(0x0C, String, join(packValueOf, encode));
  preset.addExtPacker(0x0D, Date, join(Number, encode));
  preset.addExtPacker(0x0F, Number, join(packValueOf, encode));

  preset.addExtUnpacker(0x0A, join(decode, unpackRegExp));
  preset.addExtUnpacker(0x0B, join(decode, unpackClass(Boolean)));
  preset.addExtUnpacker(0x0C, join(decode, unpackClass(String)));
  preset.addExtUnpacker(0x0D, join(decode, unpackClass(Date)));
  preset.addExtUnpacker(0x0F, join(decode, unpackClass(Number)));

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
    preset.addExtUnpacker(0x13, join(unpackArrayBuffer, unpackClass(Int16Array)));
    preset.addExtUnpacker(0x14, join(unpackArrayBuffer, unpackClass(Uint16Array)));
    preset.addExtUnpacker(0x15, join(unpackArrayBuffer, unpackClass(Int32Array)));
    preset.addExtUnpacker(0x16, join(unpackArrayBuffer, unpackClass(Uint32Array)));
    preset.addExtUnpacker(0x17, join(unpackArrayBuffer, unpackClass(Float32Array)));

    if ("undefined" !== typeof Float64Array) {
      // PhantomJS/1.9.7 doesn't have Float64Array
      preset.addExtPacker(0x18, Float64Array, packTypedArray);
      preset.addExtUnpacker(0x18, join(unpackArrayBuffer, unpackClass(Float64Array)));
    }

    if ("undefined" !== typeof Uint8ClampedArray) {
      // IE10 doesn't have Uint8ClampedArray
      preset.addExtPacker(0x19, Uint8ClampedArray, packBuffer);
      preset.addExtUnpacker(0x19, unpackClass(Uint8ClampedArray));
    }

    preset.addExtPacker(0x1A, ArrayBuffer, packArrayBuffer);
    preset.addExtPacker(0x1D, DataView, packTypedArray);
    preset.addExtUnpacker(0x1A, unpackArrayBuffer);
    preset.addExtUnpacker(0x1D, join(unpackArrayBuffer, unpackClass(DataView)));
  }
}

function join(filters) {
  filters = Array.prototype.slice.call(arguments);

  return function(value) {
    return filters.reduce(iterator, value);
  };

  function iterator(value, filter) {
    return filter(value);
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
