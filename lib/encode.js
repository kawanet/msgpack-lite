// encode.js

var BUFFER_LENGTH = 8192;

exports.encode = function(value, stream) {
  var tempStream;
  if (!stream) {
    tempStream = stream = [];
    stream.write = stream.push.bind(stream);
  }
  var encoder = new Encoder(stream);
  encoder.encode(value);
  return tempStream ? Buffer.concat(tempStream) : stream;
};

function Encoder(stream) {
  this.flush();
  this._write = stream.write.bind(stream);
}

Encoder.prototype.flush = function() {
  if (this.offset) {
    this._write(this.buffer.slice(0, this.offset));
    this.buffer = null;
  }
  if (!this.buffer) {
    this.buffer = new Buffer(BUFFER_LENGTH);
  }
  this.offset = 0;
};

Encoder.prototype.write = function(buffer) {
  var end = this.offset + buffer.length;
  if (end >= BUFFER_LENGTH) {
    this.flush();
    this._write(buffer);
  } else {
    buffer.copy(this.buffer, this.offset);
    this.offset = end;
  }
};

var write1 = {};
var token = {};

init();

var types = {
  undefined: token[0xc0],
  boolean: boolean,
  number: number,
  string: string,
  object: object
};

Encoder.prototype.encode = function(value) {
  var res = this._encode(value);
  this.flush();
  return res;
};

Encoder.prototype._encode = function(value) {
  var type = typeof value;
  var func = types[type];
  if (!func) throw new Error("Unknown type: " + type);
  return func.call(this, value);
};

function init() {
  var i;

  var uint8 = writeN(1, Buffer.prototype.writeUInt8);
  var uint16 = writeN(2, Buffer.prototype.writeUInt16BE);
  var uint32 = writeN(4, Buffer.prototype.writeUInt32BE);
  var uint64 = write0(8); // TODO
  var int8 = writeN(1, Buffer.prototype.writeInt8);
  var int16 = writeN(2, Buffer.prototype.writeInt16BE);
  var int32 = writeN(4, Buffer.prototype.writeInt32BE);
  var int64 = write0(8); // TODO
  var float32 = writeN(4, Buffer.prototype.writeFloatBE);
  var float64 = writeN(8, Buffer.prototype.writeDoubleBE);

  // positive fixint -- 0x00 - 0x7f
  // nil -- 0xc0
  // false -- 0xc2
  // true -- 0xc3
  // negative fixint -- 0xe0 - 0xff
  for (i = 0x00; i <= 0xFF; i++) {
    token[i] = write1[i] = constant(i);
  }

  // bin 8 -- 0xc4
  // bin 16 -- 0xc5
  // bin 32 -- 0xc6
  token[0xc4] = pair(0xc4, uint8);
  token[0xc5] = pair(0xc5, uint16);
  token[0xc6] = pair(0xc6, uint32);

  // ext 8 -- 0xc7
  // ext 16 -- 0xc8
  // ext 32 -- 0xc9
  token[0xc7] = pair(0xc7, uint8);
  token[0xc8] = pair(0xc8, uint16);
  token[0xc9] = pair(0xc9, uint32);

  // float 32 -- 0xca
  // float 64 -- 0xcb
  token[0xca] = pair(0xca, float32);
  token[0xcb] = pair(0xcb, float64);

  // uint 8 -- 0xcc
  // uint 16 -- 0xcd
  // uint 32 -- 0xce
  // uint 64 -- 0xcf
  token[0xcc] = pair(0xcc, uint8);
  token[0xcd] = pair(0xcd, uint16);
  token[0xce] = pair(0xce, uint32);
  token[0xcf] = pair(0xcf, uint64);

  // int 8 -- 0xd0
  // int 16 -- 0xd1
  // int 32 -- 0xd2
  // int 64 -- 0xd3
  token[0xd0] = pair(0xd0, int8);
  token[0xd1] = pair(0xd1, int16);
  token[0xd2] = pair(0xd2, int32);
  token[0xd3] = pair(0xd3, int64);

  // str 8 -- 0xd9
  // str 16 -- 0xda
  // str 32 -- 0xdb
  // array 16 -- 0xdc
  // array 32 -- 0xdd
  // map 16 -- 0xde
  // map 32 -- 0xdf
  token[0xd9] = pair(0xd9, uint8);
  token[0xda] = pair(0xda, uint16);
  token[0xdb] = pair(0xdb, uint32);
  token[0xdc] = pair(0xdc, uint16);
  token[0xdd] = pair(0xdd, uint32);
  token[0xde] = pair(0xde, uint16);
  token[0xdf] = pair(0xdf, uint32);
}

function constant(value) {
  return function() {
    var end = this.offset + 1;
    if (end >= BUFFER_LENGTH) this.flush();
    this.buffer.writeUInt8(value, this.offset++);
  };
}

function writeN(len, method) {
  return function(value) {
    var end = this.offset + len;
    if (end >= BUFFER_LENGTH) this.flush();
    method.call(this.buffer, value, this.offset);
    this.offset = this.offset + len;
  };
}

function write0(len) {
  return function() {
    var end = this.offset + len;
    if (end >= BUFFER_LENGTH) this.flush();
    this.buffer.fill(0, this.offset, end);
    this.offset = this.offset + len;
  };
}

function pair(type, func) {
  type = write1[type];
  return function(value) {
    type.call(this);
    func.call(this, value);
  };
}

function boolean(value) {
  // false -- 0xc2
  // true -- 0xc3
  var type = value ? 0xc3 : 0xc2;
  return token[type].call(this, value);
}

function number(value) {
  var ivalue = value | 0;
  var type;
  if (value !== ivalue) {
    // float 64 -- 0xcb
    type = 0xcb;
  } else if (-16 <= ivalue && ivalue < 0x7F) {
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
    type = (-0x7F <= ivalue) ? 0xd0 : (-0x7FFF <= ivalue) ? 0xd1 : 0xd2;
  }
  return token[type].call(this, value);
}

function string(value) {
  // str 8 -- 0xd9
  // str 16 -- 0xda
  // str 32 -- 0xdb
  // fixstr -- 0xa0 - 0xbf
  var buffer = new Buffer(value, "utf-8");
  var length = buffer.length;
  var type = (length < 32) ? (0xa0 + length) : (length <= 0xFF) ? 0xd9 : (length <= 0xFFFF) ? 0xda : 0xdb;
  token[type].call(this, length);
  return this.write(buffer);
}

function object(value) {
  var that = this;
  var type;
  var ret;
  var length;
  if (value === null) {
    // nil -- 0xc0
    type = 0xc0;
    ret = token[type].call(that, value);
  } else if (value instanceof Array) {
    // fixarray -- 0x90 - 0x9f
    // array 16 -- 0xdc
    // array 32 -- 0xdd
    length = value.length;
    type = (length < 16) ? (0x90 + length) : (length <= 0xFFFF) ? 0xdc : 0xdd;
    ret = token[type].call(that, length);
    for (var i = 0; i < length; i++) {
      ret = that._encode(value[i]);
    }
  } else if (value instanceof Buffer) {
    // bin 8 -- 0xc4
    // bin 16 -- 0xc5
    // bin 32 -- 0xc6
    length = value.length;
    type = (length < 0xFF) ? 0xc4 : (length <= 0xFFFF) ? 0xc5 : 0xc6;
    token[type].call(that, length);
    ret = that.write(value);
  } else {
    // fixmap -- 0x80 - 0x8f
    // map 16 -- 0xde
    // map 32 -- 0xdf
    var keys = Object.keys(value);
    length = keys.length;
    type = (length < 16) ? (0x80 + length) : (length <= 0xFFFF) ? 0xde : 0xdf;
    ret = token[type].call(that, length);
    keys.forEach(function(key) {
      that._encode(key);
      ret = that._encode(value[key]);
    });
  }
  return ret;
}
