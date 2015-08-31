// ext.js

var ERROR_COLUMNS = {name: 1, message: 1, stack: 1, columnNumber: 1, fileName: 1, lineNumber: 1};

exports.register = Ext;
exports.encoder = getEncoderByName;
exports.decoder = getDecoderByType;

var encode = require("./encode").encode;
var decode = require("./decode").decode;
var SuperExtBuffer = require("./ext-buffer").ExtBuffer;

var encodersList = [];
var encoders = {};
var decoders = [];
var extBufferPrototype = new SuperExtBuffer();

function Ext(Type, Class) {
  if (!(this instanceof Ext)) return new Ext(Type, Class);
  if ("string" === typeof Type) Type = Type.charCodeAt(0);
  this.Type = Type;
  this.Class = Class;
  decoders[Type] = this;
  if (!Class) return;
  var name = Class.prototype && Class.prototype.constructor && Class.prototype.constructor.name;
  if (name && name !== "Object") {
    encoders[name] = this;
  } else {
    encodersList.unshift(this);
  }
}

Ext.prototype.type = function() {
  return this.Type;
};

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
  return new this.Class(value);
};

Ext.prototype.encode = function(value) {
  return encode(this.parse(value));
};

Ext.prototype.decode = function(value) {
  return this.build(decode(value));
};

function join(prev, current) {
  return function(value) {
    return current(prev(value));
  };
}

init();

function init() {
  var e = Ext(0, SuperExtBuffer).encoder(getBuffer).decoder(SuperExtBuffer);
  e.type = getType;

  // Default ExtBuffer
  for (var i = 1; i < 256; i++) {
    Ext(i).encoder(getBuffer).decoder(createExtBuffer(i)).type = getType;
  }

  // ErrorType
  var copyErrorColumns = map(ERROR_COLUMNS);
  Ext(0x0E, Error).parser(copyErrorColumns).builder(buildError); // should first
  Ext(0x01, EvalError).parser(copyErrorColumns).builder(buildError);
  Ext(0x02, RangeError).parser(copyErrorColumns).builder(buildError);
  Ext(0x03, ReferenceError).parser(copyErrorColumns).builder(buildError);
  Ext(0x04, SyntaxError).parser(copyErrorColumns).builder(buildError);
  Ext(0x05, TypeError).parser(copyErrorColumns).builder(buildError);
  Ext(0x06, URIError).parser(copyErrorColumns).builder(buildError);

  Ext(0x0A, RegExp).parser(parseRegExp).builder(buildRegExp);
  Ext(0x0B, Boolean).parser(Number);
  Ext(0x0C, String);
  Ext(0x0D, Date).parser(Number);
  Ext(0x0F, Number);

  if ("undefined" !== typeof Uint8Array) {
    Ext(0x11, Int8Array).encoder(Buffer).decoder(create(Int8Array));
    Ext(0x12, Uint8Array).encoder(Buffer).decoder(create(Uint8Array));
    Ext(0x13, Int16Array).encoder(encodeTypedArray).decoder(decodeArrayBuffer, create(Int16Array));
    Ext(0x14, Uint16Array).encoder(encodeTypedArray).decoder(decodeArrayBuffer, create(Uint16Array));
    Ext(0x15, Int32Array).encoder(encodeTypedArray).decoder(decodeArrayBuffer, create(Int32Array));
    Ext(0x16, Uint32Array).encoder(encodeTypedArray).decoder(decodeArrayBuffer, create(Uint32Array));
    Ext(0x17, Float32Array).encoder(encodeTypedArray).decoder(decodeArrayBuffer, create(Float32Array));
    if ("undefined" !== typeof Float64Array) {
      // PhantomJS/1.9.7 doesn't have Float64Array
      Ext(0x18, Float64Array).encoder(encodeTypedArray).decoder(decodeArrayBuffer, create(Float64Array));
    }
    if ("undefined" !== typeof Uint8ClampedArray) {
      // IE10 doesn't have Uint8ClampedArray
      Ext(0x19, Uint8ClampedArray).encoder(Buffer).decoder(create(Uint8ClampedArray));
    }
    Ext(0x1A, ArrayBuffer).encoder(encodeArrayBuffer).decoder(decodeArrayBuffer);
    Ext(0x1D, DataView).encoder(encodeTypedArray).decoder(decodeArrayBuffer, create(DataView));
  }
}

function buildError(value) {
  var E = this.Class || Error;
  var out = new E();
  for (var key in ERROR_COLUMNS) {
    out[key] = value[key];
  }
  return out;
}

function parseRegExp(value) {
  value = RegExp.prototype.toString.call(value).split("/");
  value.shift();
  var out = [value.pop()];
  out.unshift(value.join("/"));
  return out;
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

function createExtBuffer(type) {
  ExtBuffer.prototype = extBufferPrototype; // share
  return ExtBuffer;

  function ExtBuffer(buffer) {
    if (!(this instanceof ExtBuffer)) return new ExtBuffer(buffer);
    SuperExtBuffer.call(this, buffer);
    this.type = type;
  }
}

function getBuffer(value) {
  return value.buffer;
}

function getType(value) {
  return value.type;
}

function getEncoderByName(value) {
  var c = value.constructor;
  var e = c && c.name && encoders[c.name];
  if (e) return e;
  var len = encodersList.length;
  if (!len) return;
  for (var i = 0; i < len; i++) {
    e = encodersList[i];
    var Class = e.Class;
    if (Class && value instanceof Class) return e;
  }
}

function getDecoderByType(type) {
  return decoders[type];
}
