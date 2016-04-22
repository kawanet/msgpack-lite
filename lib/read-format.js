// read-format.js

var ieee754 = require("ieee754");
var Int64Buffer = require("int64-buffer");
var Uint64BE = Int64Buffer.Uint64BE;
var Int64BE = Int64Buffer.Int64BE;

exports.getReadFormat = getReadFormat;
exports.readUint8 = uint8;

var BufferLite = require("./buffer-lite");
var BufferShortageError = require("./buffer-shortage").BufferShortageError;

var IS_BUFFER_SHIM = ("TYPED_ARRAY_SUPPORT" in Buffer);
var NO_ASSERT = true;

function getReadFormat(options) {
  var readFormat = {
    map: map,
    array: array,
    str: str,
    bin: bin,
    ext: ext,
    uint8: uint8,
    uint16: uint16,
    uint32: read(4, Buffer.prototype.readUInt32BE),
    uint64: read(8, readUInt64BE),
    int8: read(1, Buffer.prototype.readInt8),
    int16: read(2, Buffer.prototype.readInt16BE),
    int32: read(4, Buffer.prototype.readInt32BE),
    int64: read(8, readInt64BE),
    float32: read(4, readFloatBE),
    float64: read(8, readDoubleBE)
  };

  if (options && options.int64) {
    readFormat.uint64 = read(8, readUInt64BE_int64);
    readFormat.int64 = read(8, readInt64BE_int64);
  }

  return readFormat;
}

function map(decoder, len) {
  var value = {};
  var i;
  var k = new Array(len);
  var v = new Array(len);

  var decode = decoder.codec.decode;
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
  var decode = decoder.codec.decode;
  for (var i = 0; i < len; i++) {
    value[i] = decode(decoder);
  }
  return value;
}

function str(decoder, len) {
  var start = decoder.offset;
  var end = decoder.offset = start + len;
  var buffer = decoder.buffer;
  if (end > buffer.length) throw new BufferShortageError();
  if (IS_BUFFER_SHIM || !Buffer.isBuffer(buffer)) {
    // slower (compat)
    return BufferLite.readString.call(buffer, start, end);
  } else {
    // 2x faster
    return buffer.toString("utf-8", start, end);
  }
}

function bin(decoder, len) {
  var start = decoder.offset;
  var end = decoder.offset = start + len;
  if (end > decoder.buffer.length) throw new BufferShortageError();
  return slice.call(decoder.buffer, start, end);
}

function ext(decoder, len) {
  var start = decoder.offset;
  var end = decoder.offset = start + len + 1;
  if (end > decoder.buffer.length) throw new BufferShortageError();
  var type = decoder.buffer[start];
  var unpack = decoder.codec.getExtUnpacker(type);
  if (!unpack) throw new Error("Invalid ext type: " + (type ? ("0x" + type.toString(16)) : type));
  var buf = slice.call(decoder.buffer, start + 1, end);
  return unpack(buf);
}

function uint8(decoder) {
  var buffer = decoder.buffer;
  if (decoder.offset >= buffer.length) throw new BufferShortageError();
  return buffer[decoder.offset++];
}

function uint16(decoder) {
  var buffer = decoder.buffer;
  if (decoder.offset + 2 > buffer.length) throw new BufferShortageError();
  return (buffer[decoder.offset++] << 8) | buffer[decoder.offset++];
}

function read(len, method) {
  return function(decoder) {
    var start = decoder.offset;
    var end = decoder.offset = start + len;
    if (end > decoder.buffer.length) throw new BufferShortageError();
    return method.call(decoder.buffer, start, NO_ASSERT);
  };
}

function readUInt64BE(start) {
  return new Uint64BE(this, start).toNumber();
}

function readInt64BE(start) {
  return new Int64BE(this, start).toNumber();
}

function readUInt64BE_int64(start) {
  return new Uint64BE(this, start);
}

function readInt64BE_int64(start) {
  return new Int64BE(this, start);
}

function readFloatBE(start) {
  if (this.readFloatBE) return this.readFloatBE(start);
  return ieee754.read(this, start, false, 23, 4);
}

function readDoubleBE(start) {
  if (this.readDoubleBE) return this.readDoubleBE(start);
  return ieee754.read(this, start, false, 52, 8);
}

function slice(start, end) {
  var f = this.slice || Array.prototype.slice;
  var buf = f.call(this, start, end);
  if (!Buffer.isBuffer(buf)) buf = Buffer(buf);
  return buf;
}
