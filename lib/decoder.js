// decoder.js

exports.Decoder = Decoder;

var BufferLite = require("./buffer-lite");
var extdecoder = require("./ext").decoder;

var IS_BUFFER_SHIM = ("TYPED_ARRAY_SUPPORT" in Buffer);
var NO_ASSERT = true;
var BUFFER_SHORTAGE = new Error("BUFFER_SHORTAGE");

function Decoder(output) {
  if (!(this instanceof Decoder)) return new Decoder(output);
  this.output = output;
}

Decoder.prototype.push = function(buffer) {
  this.output.push(buffer);
};

Decoder.prototype.decode = function(chunk) {
  var prev = this.offset ? this.buffer.slice(this.offset) : this.buffer;
  this.buffer = prev ? Buffer.concat([prev, chunk]) : chunk;
  this.bufferLength = this.buffer.length | 0;
  this.offset = 0;
  return this.flush();
};

Decoder.prototype.flush = function() {
  var decoded;
  while (this.offset < this.bufferLength) {
    if (!this.__flush()) break;
    decoded = true;
  }
  return decoded;
};

Decoder.prototype.__flush = function() {
  if (!this.bufferLength) return;
  var start = this.offset;
  var value;
  try {
    value = decode(this);
  } catch (e) {
    if (e !== BUFFER_SHORTAGE) throw e;
    // rollback
    this.offset = start;
    return;
  }
  this.push(value);

  // indicates decode succeeded
  return true;
};

var token = [];

init();

function init() {
  var i;
  var uint32 = read(4, Buffer.prototype.readUInt32BE);
  var uint64 = read(8, readUInt64BE);
  var int8 = read(1, Buffer.prototype.readInt8);
  var int16 = read(2, Buffer.prototype.readInt16BE);
  var int32 = read(4, Buffer.prototype.readInt32BE);
  var int64 = read(8, readInt64BE);
  var float32 = read(4, Buffer.prototype.readFloatBE);
  var float64 = read(8, Buffer.prototype.readDoubleBE);

  // positive fixint -- 0x00 - 0x7f
  for (i = 0x00; i <= 0x7f; i++) {
    token[i] = constant(i);
  }

  // fixmap -- 0x80 - 0x8f
  for (i = 0x80; i <= 0x8f; i++) {
    token[i] = fix(i - 0x80, map);
  }

  // fixarray -- 0x90 - 0x9f
  for (i = 0x90; i <= 0x9f; i++) {
    token[i] = fix(i - 0x90, array);
  }

  // fixstr -- 0xa0 - 0xbf
  for (i = 0xa0; i <= 0xbf; i++) {
    token[i] = fix(i - 0xa0, str);
  }

  // nil -- 0xc0
  token[0xc0] = constant(null);

  // (never used) -- 0xc1
  delete token[0xc1];

  // false -- 0xc2
  // true -- 0xc3
  token[0xc2] = constant(false);
  token[0xc3] = constant(true);

  // bin 8 -- 0xc4
  // bin 16 -- 0xc5
  // bin 32 -- 0xc6
  token[0xc4] = flex(uint8, bin);
  token[0xc5] = flex(uint16, bin);
  token[0xc6] = flex(uint32, bin);

  // ext 8 -- 0xc7
  // ext 16 -- 0xc8
  // ext 32 -- 0xc9
  token[0xc7] = flex(uint8, ext);
  token[0xc8] = flex(uint16, ext);
  token[0xc9] = flex(uint32, ext);

  // float 32 -- 0xca
  // float 64 -- 0xcb
  token[0xca] = float32;
  token[0xcb] = float64;

  // uint 8 -- 0xcc
  // uint 16 -- 0xcd
  // uint 32 -- 0xce
  // uint 64 -- 0xcf
  token[0xcc] = uint8;
  token[0xcd] = uint16;
  token[0xce] = uint32;
  token[0xcf] = uint64;

  // int 8 -- 0xd0
  // int 16 -- 0xd1
  // int 32 -- 0xd2
  // int 64 -- 0xd3
  token[0xd0] = int8;
  token[0xd1] = int16;
  token[0xd2] = int32;
  token[0xd3] = int64;

  // fixext 1 -- 0xd4
  // fixext 2 -- 0xd5
  // fixext 4 -- 0xd6
  // fixext 8 -- 0xd7
  // fixext 16 -- 0xd8
  token[0xd4] = fix(1, ext);
  token[0xd5] = fix(2, ext);
  token[0xd6] = fix(4, ext);
  token[0xd7] = fix(8, ext);
  token[0xd8] = fix(16, ext);

  // str 8 -- 0xd9
  // str 16 -- 0xda
  // str 32 -- 0xdb
  // array 16 -- 0xdc
  // array 32 -- 0xdd
  // map 16 -- 0xde
  // map 32 -- 0xdf
  token[0xd9] = flex(uint8, str);
  token[0xda] = flex(uint16, str);
  token[0xdb] = flex(uint32, str);
  token[0xdc] = flex(uint16, array);
  token[0xdd] = flex(uint32, array);
  token[0xde] = flex(uint16, map);
  token[0xdf] = flex(uint32, map);

  // negative fixint -- 0xe0 - 0xff
  for (i = 0xe0; i <= 0xff; i++) {
    token[i] = constant(i - 0x100);
  }
}

function uint8(decoder) {
  if (decoder.offset >= decoder.bufferLength) throw BUFFER_SHORTAGE;
  return decoder.buffer[decoder.offset++];
}

function uint16(decoder) {
  var buffer = decoder.buffer;
  if (decoder.offset + 2 > decoder.bufferLength) throw BUFFER_SHORTAGE;
  return (buffer[decoder.offset++] << 8) | buffer[decoder.offset++];
}

function decode(decoder) {
  var type = uint8(decoder);
  var func = token[type];
  if (!func) throw new Error("Invalid type: " + (type ? ("0x" + type.toString(16)) : type));
  return func(decoder);
}

function constant(value) {
  return function() {
    return value;
  };
}

function flex(lenFunc, decodeFunc) {
  return function(decoder) {
    var len = lenFunc(decoder);
    return decodeFunc(decoder, len);
  };
}

function fix(len, method) {
  return function(decoder) {
    return method(decoder, len);
  };
}

function map(decoder, len) {
  var value = {};
  var i;
  var k = new Array(len);
  var v = new Array(len);
  for (i = 0; i < len; i++) {
    k[i] = decode(decoder);
    v[i] = decode(decoder);
  }
  for (i = 0; i < len; i++) {
    value[k[i]] = v[i];
  }
  return value;
}

function array(decoder, len) {
  var value = new Array(len);
  for (var i = 0; i < len; i++) {
    value[i] = decode(decoder);
  }
  return value;
}

function str(decoder, len) {
  var start = decoder.offset;
  var end = decoder.offset = start + len;
  if (end > decoder.bufferLength) throw BUFFER_SHORTAGE;
  if (IS_BUFFER_SHIM) {
    // slower (compat)
    return BufferLite.readString.call(decoder.buffer, start, end);
  } else {
    // 2x faster
    return decoder.buffer.toString("utf-8", start, end);
  }
}

function read(len, method) {
  return function(decoder) {
    var start = decoder.offset;
    var end = decoder.offset = start + len;
    if (end > decoder.bufferLength) throw BUFFER_SHORTAGE;
    return method.call(decoder.buffer, start, NO_ASSERT);
  };
}

function readUInt64BE(start, noAssert) {
  var upper = this.readUInt32BE(start, noAssert);
  var lower = this.readUInt32BE(start + 4, noAssert);
  return upper ? (upper * 4294967296 + lower) : lower;
}

function readInt64BE(start, noAssert) {
  var upper = this.readInt32BE(start, noAssert);
  var lower = this.readUInt32BE(start + 4, noAssert);
  return upper ? (upper * 4294967296 + lower) : lower;
}

function bin(decoder, len) {
  var start = decoder.offset;
  var end = decoder.offset = start + len;
  if (end > decoder.bufferLength) throw BUFFER_SHORTAGE;
  return decoder.buffer.slice(start, end);
}

function ext(decoder, len) {
  var start = decoder.offset;
  var end = decoder.offset = start + len + 1;
  if (end > decoder.bufferLength) throw BUFFER_SHORTAGE;
  var type = decoder.buffer[start];
  var e = extdecoder(type);
  if (e) {
    var buf = decoder.buffer.slice(start + 1, end);
    return e.decode(buf);
  }
  return decoder.buffer.slice(start, end);
}
