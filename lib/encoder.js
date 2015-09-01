// encode.js

exports.Encoder = Encoder;

var BufferLite = require("./buffer-lite");
var extencoder = require("./ext").encoder;
var ExtBuffer = require("./ext-buffer").ExtBuffer;

var MIN_BUFFER_SIZE = 2048;
var MAX_BUFFER_SIZE = 65536;

var NO_ASSERT = true;
var IS_BUFFER_SHIM = ("TYPED_ARRAY_SUPPORT" in Buffer);
var NO_TYPED_ARRAY = IS_BUFFER_SHIM && !Buffer.TYPED_ARRAY_SUPPORT;
var IS_ARRAY = Array.isArray || isArray;

function Encoder(output) {
  if (!(this instanceof Encoder)) return new Encoder(output);
  this.output = output;
}

Encoder.prototype.push = function(buffer) {
  this.output.push(buffer);
};

Encoder.prototype.encode = function(chunk) {
  encode(this, chunk);
};

Encoder.prototype.flush = function() {
  if (this.offset) {
    this.push(this.buffer.slice(0, this.offset));
    this.buffer = null;
    this.offset = 0;
  }
};

Encoder.prototype.reserve = function(length) {
  if (!this.buffer) return this.alloc(length);

  var size = this.buffer.length;

  // is it long enough?
  if (this.offset + length < size) return;

  // flush current buffer
  if (this.offset) this.flush();

  // resize it to 2x current length
  this.alloc(Math.max(length, Math.min(size * 2, MAX_BUFFER_SIZE)));
};

Encoder.prototype.alloc = function(length) {
  // allocate new buffer
  this.buffer = new Buffer(length > MIN_BUFFER_SIZE ? length : MIN_BUFFER_SIZE);
  this.offset = 0;
};

Encoder.prototype.send = function(buffer) {
  var end = this.offset + buffer.length;
  if (this.buffer && end < this.buffer.length) {
    buffer.copy(this.buffer, this.offset);
    this.offset = end;
  } else {
    this.flush();
    this.push(buffer);
  }
};

var constant = new Array(256);
var token = new Array(256);
init();

function init() {
  // positive fixint -- 0x00 - 0x7f
  // nil -- 0xc0
  // false -- 0xc2
  // true -- 0xc3
  // negative fixint -- 0xe0 - 0xff
  for (var i = 0x00; i <= 0xFF; i++) {
    token[i] = constant[i] = write0(i);
  }

  if (NO_TYPED_ARRAY) {
    init_compatible(); // old browsers
  } else {
    init_optimized(); // Node.js and browsers with TypedArray
  }
}

function init_optimized() {
  // bin 8 -- 0xc4
  // bin 16 -- 0xc5
  // bin 32 -- 0xc6
  token[0xc4] = write1(0xc4);
  token[0xc5] = write2(0xc5);
  token[0xc6] = write4(0xc6);

  // ext 8 -- 0xc7
  // ext 16 -- 0xc8
  // ext 32 -- 0xc9
  token[0xc7] = write1(0xc7);
  token[0xc8] = write2(0xc8);
  token[0xc9] = write4(0xc9);

  // float 32 -- 0xca
  // float 64 -- 0xcb
  token[0xca] = writeN(0xca, 4, Buffer.prototype.writeFloatBE);
  token[0xcb] = writeN(0xcb, 8, Buffer.prototype.writeDoubleBE);

  // uint 8 -- 0xcc
  // uint 16 -- 0xcd
  // uint 32 -- 0xce
  // uint 64 -- 0xcf
  token[0xcc] = write1(0xcc);
  token[0xcd] = write2(0xcd);
  token[0xce] = write4(0xce);
  token[0xcf] = writeN(0xcf, 8, BufferLite.writeUint64BE);

  // int 8 -- 0xd0
  // int 16 -- 0xd1
  // int 32 -- 0xd2
  // int 64 -- 0xd3
  token[0xd0] = write1(0xd0);
  token[0xd1] = write2(0xd1);
  token[0xd2] = write4(0xd2);
  token[0xd3] = writeN(0xd3, 8, BufferLite.writeUint64BE);

  // str 8 -- 0xd9
  // str 16 -- 0xda
  // str 32 -- 0xdb
  // array 16 -- 0xdc
  // array 32 -- 0xdd
  // map 16 -- 0xde
  // map 32 -- 0xdf
  token[0xd9] = write1(0xd9);
  token[0xda] = write2(0xda);
  token[0xdb] = write4(0xdb);
  token[0xdc] = write2(0xdc);
  token[0xdd] = write4(0xdd);
  token[0xde] = write2(0xde);
  token[0xdf] = write4(0xdf);
}

function init_compatible() {
  token[0xc4] = writeN(0xc4, 1, Buffer.prototype.writeUInt8);
  token[0xc5] = writeN(0xc5, 2, Buffer.prototype.writeUInt16BE);
  token[0xc6] = writeN(0xc6, 4, Buffer.prototype.writeUInt32BE);
  token[0xc7] = writeN(0xc7, 1, Buffer.prototype.writeUInt8);
  token[0xc8] = writeN(0xc8, 2, Buffer.prototype.writeUInt16BE);
  token[0xc9] = writeN(0xc9, 4, Buffer.prototype.writeUInt32BE);
  token[0xca] = writeN(0xca, 4, Buffer.prototype.writeFloatBE);
  token[0xcb] = writeN(0xcb, 8, Buffer.prototype.writeDoubleBE);
  token[0xcc] = writeN(0xcc, 1, Buffer.prototype.writeUInt8);
  token[0xcd] = writeN(0xcd, 2, Buffer.prototype.writeUInt16BE);
  token[0xce] = writeN(0xce, 4, Buffer.prototype.writeUInt32BE);
  token[0xcf] = writeN(0xcf, 8, BufferLite.writeUint64BE);
  token[0xd0] = writeN(0xd0, 1, Buffer.prototype.writeInt8);
  token[0xd1] = writeN(0xd1, 2, Buffer.prototype.writeInt16BE);
  token[0xd2] = writeN(0xd2, 4, Buffer.prototype.writeInt32BE);
  token[0xd3] = writeN(0xd3, 8, BufferLite.writeUint64BE);
  token[0xd9] = writeN(0xd9, 1, Buffer.prototype.writeUInt8);
  token[0xda] = writeN(0xda, 2, Buffer.prototype.writeUInt16BE);
  token[0xdb] = writeN(0xdb, 4, Buffer.prototype.writeUInt32BE);
  token[0xdc] = writeN(0xdc, 2, Buffer.prototype.writeUInt16BE);
  token[0xdd] = writeN(0xdd, 4, Buffer.prototype.writeUInt32BE);
  token[0xde] = writeN(0xde, 2, Buffer.prototype.writeUInt16BE);
  token[0xdf] = writeN(0xdf, 4, Buffer.prototype.writeUInt32BE);
}

function write0(type) {
  return function(encoder) {
    encoder.reserve(1);
    encoder.buffer[encoder.offset++] = type;
  };
}

function write1(type) {
  return function(encoder, value) {
    encoder.reserve(2);
    var buffer = encoder.buffer;
    var offset = encoder.offset;
    buffer[offset++] = type;
    buffer[offset++] = value;
    encoder.offset = offset;
  };
}

function write2(type) {
  return function(encoder, value) {
    encoder.reserve(3);
    var buffer = encoder.buffer;
    var offset = encoder.offset;
    buffer[offset++] = type;
    buffer[offset++] = value >>> 8;
    buffer[offset++] = value;
    encoder.offset = offset;
  };
}

function write4(type) {
  return function(encoder, value) {
    encoder.reserve(5);
    var buffer = encoder.buffer;
    var offset = encoder.offset;
    buffer[offset++] = type;
    buffer[offset++] = value >>> 24;
    buffer[offset++] = value >>> 16;
    buffer[offset++] = value >>> 8;
    buffer[offset++] = value;
    encoder.offset = offset;
  };
}

function writeN(type, len, method) {
  return function(encoder, value) {
    encoder.reserve(len + 1);
    encoder.buffer[encoder.offset++] = type;
    method.call(encoder.buffer, value, encoder.offset, NO_ASSERT);
    encoder.offset += len;
  };
}

var types = {
  "boolean": bool,
  "function": nil,
  "number": number,
  "object": object,
  "string": string,
  "symbol": nil,
  "undefined": nil
};

function encode(encoder, value) {
  var func = types[typeof value];
  if (!func) throw new Error("Unsupported type \"" + (typeof value) + "\": " + value);
  func(encoder, value);
}

function bool(encoder, value) {
  // false -- 0xc2
  // true -- 0xc3
  var type = value ? 0xc3 : 0xc2;
  token[type](encoder, value);
}

function number(encoder, value) {
  var ivalue = value | 0;
  var type;
  if (value !== ivalue) {
    // float 64 -- 0xcb
    type = 0xcb;
    token[type](encoder, value);
    return;
  } else if (-0x20 <= ivalue && ivalue <= 0x7F) {
    // positive fixint -- 0x00 - 0x7f
    // negative fixint -- 0xe0 - 0xff
    type = ivalue & 0xFF;
  } else if (0 <= ivalue) {
    // uint 8 -- 0xcc
    // uint 16 -- 0xcd
    // uint 32 -- 0xce
    // uint 64 -- 0xcf
    type = (ivalue <= 0xFF) ? 0xcc : (ivalue <= 0xFFFF) ? 0xcd : 0xce;
  } else {
    // int 8 -- 0xd0
    // int 16 -- 0xd1
    // int 32 -- 0xd2
    // int 64 -- 0xd3
    type = (-0x80 <= ivalue) ? 0xd0 : (-0x8000 <= ivalue) ? 0xd1 : 0xd2;
  }
  token[type](encoder, ivalue);
}

function string(encoder, value) {
  // str 8 -- 0xd9
  // str 16 -- 0xda
  // str 32 -- 0xdb
  // fixstr -- 0xa0 - 0xbf

  // prepare buffer
  var length = value.length;
  var maxsize = 5 + length * 3;
  encoder.reserve(maxsize);

  // expected header size
  var expected = (length < 32) ? 1 : (length <= 0xFF) ? 2 : (length <= 0xFFFF) ? 3 : 5;

  // expected start point
  var start = encoder.offset + expected;

  // write string
  length = BufferLite.writeString.call(encoder.buffer, value, start);

  // actual header size
  var actual = (length < 32) ? 1 : (length <= 0xFF) ? 2 : (length <= 0xFFFF) ? 3 : 5;

  // move content when needed
  if (expected !== actual) {
    var targetStart = encoder.offset + actual;
    var end = start + length;
    if (IS_BUFFER_SHIM) {
      BufferLite.copy.call(encoder.buffer, encoder.buffer, targetStart, start, end);
    } else {
      encoder.buffer.copy(encoder.buffer, targetStart, start, end);
    }
  }

  // write header
  var type = (actual === 1) ? (0xa0 + length) : (actual <= 3) ? 0xd7 + actual : 0xdb;
  token[type](encoder, length);

  // move cursor
  encoder.offset += length;
}

var extmap = [];
extmap[1] = 0xd4;
extmap[2] = 0xd5;
extmap[4] = 0xd6;
extmap[8] = 0xd7;
extmap[16] = 0xd8;

function object(encoder, value) {
  if (IS_ARRAY(value)) return array(encoder, value);
  if (value === null) return nil(encoder, value);
  if (Buffer.isBuffer(value)) return bin(encoder, value);
  var e = extencoder(value);
  if (e) return ext(encoder, value, e);
  map(encoder, value);
}

function nil(encoder, value) {
  // nil -- 0xc0
  var type = 0xc0;
  token[type](encoder, value);
}

function array(encoder, value) {
  // fixarray -- 0x90 - 0x9f
  // array 16 -- 0xdc
  // array 32 -- 0xdd
  var length = value.length;
  var type = (length < 16) ? (0x90 + length) : (length <= 0xFFFF) ? 0xdc : 0xdd;
  token[type](encoder, length);
  for (var i = 0; i < length; i++) {
    encode(encoder, value[i]);
  }
}

function bin(encoder, value) {
  // bin 8 -- 0xc4
  // bin 16 -- 0xc5
  // bin 32 -- 0xc6
  var length = value.length;
  var type = (length < 0xFF) ? 0xc4 : (length <= 0xFFFF) ? 0xc5 : 0xc6;
  token[type](encoder, length);
  encoder.send(value);
}

function ext(encoder, value, e) {
  // fixext 1 -- 0xd4
  // fixext 2 -- 0xd5
  // fixext 4 -- 0xd6
  // fixext 8 -- 0xd7
  // fixext 16 -- 0xd8
  // ext 8 -- 0xc7
  // ext 16 -- 0xc8
  // ext 32 -- 0xc9
  if (!e) e = extencoder(value);
  var etype = e.type(value);
  var buf = e.encode(value);
  var length = buf.length;
  var type = extmap[length] || ((length < 0xFF) ? 0xc7 : (length <= 0xFFFF) ? 0xc8 : 0xc9);
  token[type](encoder, length);
  constant[etype](encoder);
  encoder.send(buf);
}

function map(encoder, value) {
  // fixmap -- 0x80 - 0x8f
  // map 16 -- 0xde
  // map 32 -- 0xdf
  var keys = Object.keys(value);
  var length = keys.length;
  var type = (length < 16) ? (0x80 + length) : (length <= 0xFFFF) ? 0xde : 0xdf;
  token[type](encoder, length);
  keys.forEach(function(key) {
    encode(encoder, key);
    encode(encoder, value[key]);
  });
}

function isArray(array) {
  return "[object Array]" === Object.prototype.toString.call(array);
}
