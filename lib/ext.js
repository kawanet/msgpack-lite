// ext.js

var exports = module.exports = Ext;
var encoders = exports.encoders = {};
var decoders = exports.decoders = [];
exports.Error = {name: 1, message: 1, stack: 1, columnNumber: 1, fileName: 1, lineNumber: 1};

var encode = require("./encode").encode;
var decode = require("./decode").decode;

function Ext(type, className) {
  if (!(this instanceof Ext)) return new Ext(type, className);
  if ("string" === typeof type) type = type.charCodeAt(0);
  this.type = type;
  decoders[type] = this;
  encoders[className] = this;
}

Ext.prototype.encoder = function(encoder) {
  this.encode = Array.prototype.reduce.call(arguments, join);
  return this;
};

Ext.prototype.decoder = function(decoder) {
  this.decode = Array.prototype.reduce.call(arguments, join);
  return this;
};

Ext.prototype.parser = function(parse) {
  this.parse = Array.prototype.reduce.call(arguments, join);
  return this;
};

Ext.prototype.builder = function(build) {
  this.build = Array.prototype.reduce.call(arguments, join);
  return this;
};

Ext.prototype.parse = function(value) {
  return (value).valueOf();
};

Ext.prototype.build = function(value) {
  // primitive classes, such as Date, could not be available via global
  var Class = global[this.type];
  return new Class(value);
};

Ext.prototype.encode = function(value) {
  return encode(this.parse(value));
};

Ext.prototype.decode = function(value) {
  return this.build(decode(value));
};

function join(prev, current, idx) {
  return function(value) {
    return current(prev(value));
  };
}

// ErrorType
Ext(0x01, "EvalError").parser(map(exports.Error)).builder(buildError);
Ext(0x02, "RangeError").parser(map(exports.Error)).builder(buildError);
Ext(0x03, "ReferenceError").parser(map(exports.Error)).builder(buildError);
Ext(0x04, "SyntaxError").parser(map(exports.Error)).builder(buildError);
Ext(0x05, "TypeError").parser(map(exports.Error)).builder(buildError);
Ext(0x06, "URIError").parser(map(exports.Error)).builder(buildError);

Ext(0x0A, "RegExp").parser(parseRegExp).builder(buildRegExp);
Ext(0x0B, "Boolean").parser(Number).builder(create(Boolean));
Ext(0x0C, "String").builder(create(String));
Ext(0x0D, "Date").parser(Number).builder(create(Date));
Ext(0x0E, "Error").parser(map(exports.Error)).builder(buildError);
Ext(0x0F, "Number").builder(create(Number));

if ("undefined" !== typeof Uint8Array) {
  // ExternalArrayType
  Ext(0x11, "Int8Array").encoder(Buffer).decoder(create(Int8Array));
  Ext(0x12, "Uint8Array").encoder(Buffer).decoder(create(Uint8Array));
  Ext(0x13, "Int16Array").encoder(encodeTypedArray).decoder(decodeArrayBuffer, create(Int16Array));
  Ext(0x14, "Uint16Array").encoder(encodeTypedArray).decoder(decodeArrayBuffer, create(Uint16Array));
  Ext(0x15, "Int32Array").encoder(encodeTypedArray).decoder(decodeArrayBuffer, create(Int32Array));
  Ext(0x16, "Uint32Array").encoder(encodeTypedArray).decoder(decodeArrayBuffer, create(Uint32Array));
  Ext(0x17, "Float32Array").encoder(encodeTypedArray).decoder(decodeArrayBuffer, create(Float32Array));
  Ext(0x18, "Float64Array").encoder(encodeTypedArray).decoder(decodeArrayBuffer, create(Float64Array));
  Ext(0x19, "Uint8ClampedArray").encoder(Buffer).decoder(create(Uint8ClampedArray));
  Ext(0x1A, "ArrayBuffer").encoder(encodeArrayBuffer).decoder(decodeArrayBuffer);
  Ext(0x1D, "DataView").encoder(encodeTypedArray).decoder(decodeArrayBuffer, create(DataView));
}

function buildError(value) {
  var out = new Error();
  for (var key in exports.Error) {
    out[key] = value[key];
  }
  return out;
}

function parseRegExp(value) {
  return RegExp.prototype.toString.call(value).split("/").slice(1);
}

function buildRegExp(value) {
  return RegExp.apply(null, value);
}

function encodeTypedArray(value) {
  return Buffer(new Uint8Array(value.buffer));
}

function encodeArrayBuffer(value) {
  return Buffer(new Uint8Array(value));
}

function decodeArrayBuffer(value) {
  return (new Uint8Array(value)).buffer;
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
