// ext.js

var exports = module.exports = Ext;
var encoders = exports.encoders = {};
var decoders = exports.decoders = [];
exports.Error = {name: 1, message: 1};

var encode = require("./encode").encode;
var decode = require("./decode").decode;

function Ext(type, className) {
  if (!(this instanceof Ext)) return new Ext(type, className);
  if ("string" === typeof type) type = type.charCodeAt(0);
  this.type = type;
  encoders["[object " + className + "]"] = this;
  decoders[type] = this;
}

Ext.prototype.encoder = function(encoder) {
  this.encode = Array.prototype.reduce.call(arguments, join);
  return this;
};

Ext.prototype.decoder = function(decoder) {
  this.decode = Array.prototype.reduce.call(arguments, join);
  return this;
};

function join(prev, current, idx) {
  return function(value) {
    return current(prev(value));
  };
}

Ext("D", "Date").encoder(Number, encode).decoder(decode, create(Date));
Ext("E", "Error").encoder(map(exports.Error), encode).decoder(decode, encodeError);
Ext("R", "RegExp").encoder(encodeRegExp, encode).decoder(decode, decodeRegExp);
Ext("N", "Number").encoder(Number, encode).decoder(decode, create(Number));
Ext("S", "String").encoder(String, encode).decoder(decode, create(String));

if ("undefined" !== typeof Uint8Array) {
  Ext(7, "Int8Array").encoder(Buffer).decoder(create(Int8Array));
  Ext(8, "Uint8Array").encoder(Buffer).decoder(create(Uint8Array));
  Ext(9, "Uint8ClampedArray").encoder(Buffer).decoder(create(Uint8ClampedArray));
  Ext(15, "Int16Array").encoder(encodeTypedArray).decoder(decodeTypedArray(Int16Array));
  Ext(16, "Uint16Array").encoder(encodeTypedArray).decoder(decodeTypedArray(Uint16Array));
  Ext(31, "Int32Array").encoder(encodeTypedArray).decoder(decodeTypedArray(Int32Array));
  Ext(32, "Uint32Array").encoder(encodeTypedArray).decoder(decodeTypedArray(Uint32Array));
  Ext(2, "Float32Array").encoder(encodeTypedArray).decoder(decodeTypedArray(Float32Array));
  Ext(6, "Float64Array").encoder(encodeTypedArray).decoder(decodeTypedArray(Float64Array));
  Ext(1, "ArrayBuffer").encoder(create(Uint8Array), Buffer).decoder(decodeArrayBuffer);
  Ext(4, "DataView").encoder(encodeTypedArray).decoder(decodeTypedArray(DataView));
}

function encodeError(value) {
  var out = new Error();
  for (var key in exports.Error) {
    out[key] = value[key];
  }
  return out;
}

function encodeRegExp(value) {
  return RegExp.prototype.toString.call(value).split("/").slice(1);
}

function decodeRegExp(value) {
  return RegExp.apply(null, value);
}

function encodeTypedArray(array) {
  return Buffer(new Uint8Array(array.buffer));
}

function decodeTypedArray(Class) {
  return function(buffer) {
    return new Class((new Uint8Array(buffer)).buffer);
  };
}

function decodeArrayBuffer(buffer) {
  return (new Uint8Array(buffer)).buffer;
}

function create(Class) {
  return function(value) {
    return new Class(value);
  };
}

function map(fields) {
  return function(value) {
    var out = {};
    for (var key in fields) {
      out[key] = value[key];
    }
    return out;
  };
}
