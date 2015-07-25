// decode.js

exports.decode = function(buffer) {
  var decoder = new Decoder(buffer);
  return decoder.decode();
};

function Decoder(buffer, offset) {
  this.buffer = buffer || new Buffer();
  this.offset = offset || 0;
}

var uint8 = read(1, Buffer.prototype.readUInt8);
var uint16 = read(2, Buffer.prototype.readUInt16BE);
var uint32 = read(4, Buffer.prototype.readUInt32BE);
var uint64 = fix(8, ext); // TODO
var int8 = read(1, Buffer.prototype.readInt8);
var int16 = read(2, Buffer.prototype.readInt16BE);
var int32 = read(4, Buffer.prototype.readInt32BE);
var int64 = fix(8, ext); // TODO
var float32 = read(4, Buffer.prototype.readFloatBE);
var float64 = read(8, Buffer.prototype.readDoubleBE);

Decoder.prototype.decode = decode;

var msg = {};
init(msg);

function init(decoder) {
  var i;

  // positive fixint -- 0x00 - 0x7f
  for (i = 0x00; i <= 0x7f; i++) {
    decoder[i] = constant(i);
  }

  // fixmap -- 0x80 - 0x8f
  for (i = 0x80; i <= 0x8f; i++) {
    decoder[i] = fix(i - 0x80, map);
  }

  // fixarray -- 0x90 - 0x9f
  for (i = 0x90; i <= 0x9f; i++) {
    decoder[i] = fix(i - 0x90, array);
  }

  // fixstr -- 0xa0 - 0xbf
  for (i = 0xa0; i <= 0xbf; i++) {
    decoder[i] = fix(i - 0xa0, str);
  }

  // nil -- 0xc0
  decoder[0xc0] = constant(null);

  // (never used) -- 0xc1
  decoder[0xc1] = constant(new Error("Invalid MessagePack token: 0xC1"));

  // false -- 0xc2
  // true -- 0xc3
  decoder[0xc2] = constant(false);
  decoder[0xc3] = constant(true);

  // bin 8 -- 0xc4
  // bin 16 -- 0xc5
  // bin 32 -- 0xc6
  decoder[0xc4] = vary(uint8, ext);
  decoder[0xc5] = vary(uint16, ext);
  decoder[0xc6] = vary(uint32, ext);

  // ext 8 -- 0xc7
  // ext 16 -- 0xc8
  // ext 32 -- 0xc9
  decoder[0xc7] = vary(uint8, ext);
  decoder[0xc8] = vary(uint16, ext);
  decoder[0xc9] = vary(uint32, ext);

  // float 32 -- 0xca
  // float 64 -- 0xcb
  decoder[0xca] = float32;
  decoder[0xcb] = float64;

  // uint 8 -- 0xcc
  // uint 16 -- 0xcd
  // uint 32 -- 0xce
  // uint 64 -- 0xcf
  decoder[0xcc] = uint8;
  decoder[0xcd] = uint16;
  decoder[0xce] = uint32;
  decoder[0xcf] = uint64;

  // int 8 -- 0xd0
  // int 16 -- 0xd1
  // int 32 -- 0xd2
  // int 64 -- 0xd3
  decoder[0xd0] = int8;
  decoder[0xd1] = int16;
  decoder[0xd2] = int32;
  decoder[0xd3] = int64;

  // ext 1 -- 0xd4
  // ext 2 -- 0xd5
  // ext 4 -- 0xd6
  // ext 8 -- 0xd7
  // ext 16 -- 0xd8
  decoder[0xd4] = fix(1, ext);
  decoder[0xd5] = fix(2, ext);
  decoder[0xd6] = fix(4, ext);
  decoder[0xd7] = fix(8, ext);
  decoder[0xd8] = fix(16, ext);

  // str 8 -- 0xd9
  // str 16 -- 0xda
  // str 32 -- 0xdb
  // array 16 -- 0xdc
  // array 32 -- 0xdd
  // map 16 -- 0xde
  // map 32 -- 0xdf
  decoder[0xd9] = vary(uint8, str);
  decoder[0xda] = vary(uint16, str);
  decoder[0xdb] = vary(uint32, str);
  decoder[0xdc] = vary(uint16, array);
  decoder[0xdd] = vary(uint32, array);
  decoder[0xde] = vary(uint16, map);
  decoder[0xdf] = vary(uint32, map);

  // negative fixint -- 0xe0 - 0xff
  for (i = 0xe0; i <= 0xff; i++) {
    decoder[i] = constant(i - 0x100);
  }
}

function decode() {
  var type = uint8.call(this);
  return msg[type].call(this);
}

function constant(value) {
  return function() {
    return value;
  };
}

function vary(lenFunc, decodeFunc) {
  return function() {
    var len = lenFunc.call(this);
    return decodeFunc.call(this, len);
  };
}

function fix(len, method) {
  return function() {
    return method.call(this, len);
  };
}

function map(len) {
  var value = {};
  for (var i = 0; i < len; i++) {
    var key = this.decode();
    value[key] = this.decode();
  }
  return value;
}

function array(len) {
  var value = [];
  for (var i = 0; i < len; i++) {
    value.push(this.decode());
  }
  return value;
}

function str(len) {
  var start = this.offset;
  var end = this.offset = start + len;
  return this.buffer.toString("utf-8", start, end);
}

function read(len, method) {
  return function() {
    var value = method.call(this.buffer, this.offset);
    this.offset += len;
    return value;
  };
}

function ext(len) {
  var end = this.offset + len;
  var buf = this.buffer.slice(this.offset, end);
  this.offset = end;
  return buf;
}
