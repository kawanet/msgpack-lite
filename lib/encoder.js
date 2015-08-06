// encode.js

exports.Encoder = Encoder;

var BufferLite = require("./buffer-lite");

var BUFFER_LENGTH = 8192;
var NO_ASSERT = true;
var IS_BUFFER_SHIM = ("TYPED_ARRAY_SUPPORT" in Buffer);

function Encoder(opts) {
  if (!(this instanceof Encoder)) return new Encoder(opts);
  if (opts && opts.push) this.push = opts.push.bind(opts);
}

Encoder.prototype.encode = function(chunk, encoding, callback) {
  if (!this.buffer) this.flush();
  encode(this, chunk);
  this.flush();
  if (callback) callback();
};

Encoder.prototype.flush = function(length) {
  if (this.offset) {
    this.push(this.buffer.slice(0, this.offset));
    this.buffer = null;
  }
  if (length < BUFFER_LENGTH) length = 0;
  if (!this.buffer || length) {
    this.buffer = new Buffer(length || BUFFER_LENGTH);
  }
  this.offset = 0;
};

Encoder.prototype.write = function(buffer) {
  var end = this.offset + buffer.length;
  if (end >= BUFFER_LENGTH) {
    this.flush();
    this.push(buffer);
  } else {
    buffer.copy(this.buffer, this.offset);
    this.offset = end;
  }
};

var token = [];

init();

function init() {
  // positive fixint -- 0x00 - 0x7f
  // nil -- 0xc0
  // false -- 0xc2
  // true -- 0xc3
  // negative fixint -- 0xe0 - 0xff
  for (var i = 0x00; i <= 0xFF; i++) {
    token[i] = write0(i);
  }

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
  token[0xcf] = write8(0xcf);

  // int 8 -- 0xd0
  // int 16 -- 0xd1
  // int 32 -- 0xd2
  // int 64 -- 0xd3
  token[0xd0] = write1(0xd0);
  token[0xd1] = write2(0xd1);
  token[0xd2] = write4(0xd2);
  token[0xd3] = write8(0xd3);

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

function write0(type) {
  return function(encoder) {
    var end = encoder.offset + 1;
    if (end >= BUFFER_LENGTH) encoder.flush();
    encoder.buffer[encoder.offset++] = type;
  };
}

function write1(type) {
  return function(encoder, value) {
    var end = encoder.offset + 2;
    if (end >= BUFFER_LENGTH) encoder.flush();
    var buffer = encoder.buffer;
    var offset = encoder.offset;
    buffer[offset++] = type;
    buffer[offset++] = value;
    encoder.offset = offset;
  };
}

function write2(type) {
  return function(encoder, value) {
    var end = encoder.offset + 3;
    if (end >= BUFFER_LENGTH) encoder.flush();
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
    var end = encoder.offset + 5;
    if (end >= BUFFER_LENGTH) encoder.flush();
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

function write8(type) {
  return function(encoder, high, low) {
    var end = encoder.offset + 9;
    if (end >= BUFFER_LENGTH) encoder.flush();
    var buffer = encoder.buffer;
    var offset = encoder.offset;
    buffer[offset++] = type;
    buffer[offset++] = high >>> 24;
    buffer[offset++] = high >>> 16;
    buffer[offset++] = high >>> 8;
    buffer[offset++] = high;
    buffer[offset++] = low >>> 24;
    buffer[offset++] = low >>> 16;
    buffer[offset++] = low >>> 8;
    buffer[offset++] = low;
    encoder.offset = offset;
  };
}

function writeN(type, len, method) {
  return function(encoder, value) {
    var end = encoder.offset + 1 + len;
    if (end >= BUFFER_LENGTH) encoder.flush();
    encoder.buffer[encoder.offset++] = type;
    method.call(encoder.buffer, value, encoder.offset, NO_ASSERT);
    encoder.offset += len;
  };
}

var undef = token[0xc0];

function encode(encoder, value) {
  var type = typeof value;
  switch (type) {
    case "undefined":
      return undef(encoder, value);
    case "boolean":
      return boolean(encoder, value);
    case "number":
      return number(encoder, value);
    case "string":
      return string(encoder, value);
    case "object":
      return object(encoder, value);
    default:
      throw new Error("Unknown type: " + type);
  }
}

function boolean(encoder, value) {
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
  token[type](encoder, value);
}

function string(encoder, value) {
  // str 8 -- 0xd9
  // str 16 -- 0xda
  // str 32 -- 0xdb
  // fixstr -- 0xa0 - 0xbf

  // prepare buffer
  var length = value.length;
  var maxsize = 5 + length * 3;
  if (encoder.offset + maxsize > BUFFER_LENGTH) {
    encoder.flush(maxsize);
  }

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

function object(encoder, value) {
  var type;
  var length;
  if (value === null) {
    // nil -- 0xc0
    type = 0xc0;
    token[type](encoder, value);
  } else if (value instanceof Array) {
    // fixarray -- 0x90 - 0x9f
    // array 16 -- 0xdc
    // array 32 -- 0xdd
    length = value.length;
    type = (length < 16) ? (0x90 + length) : (length <= 0xFFFF) ? 0xdc : 0xdd;
    token[type](encoder, length);
    for (var i = 0; i < length; i++) {
      encode(encoder, value[i]);
    }
  } else if (Buffer.isBuffer(value)) {
    // bin 8 -- 0xc4
    // bin 16 -- 0xc5
    // bin 32 -- 0xc6
    length = value.length;
    type = (length < 0xFF) ? 0xc4 : (length <= 0xFFFF) ? 0xc5 : 0xc6;
    token[type](encoder, length);
    encoder.write(value);
  } else {
    // fixmap -- 0x80 - 0x8f
    // map 16 -- 0xde
    // map 32 -- 0xdf
    var keys = Object.keys(value);
    length = keys.length;
    type = (length < 16) ? (0x80 + length) : (length <= 0xFFFF) ? 0xde : 0xdf;
    token[type](encoder, length);
    keys.forEach(function(key) {
      encode(encoder, key);
      encode(encoder, value[key]);
    });
  }
}
