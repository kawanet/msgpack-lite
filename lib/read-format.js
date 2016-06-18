// read-format.js

var Int64Buffer = require("int64-buffer");
var Uint64BE = Int64Buffer.Uint64BE;
var Int64BE = Int64Buffer.Int64BE;

exports.getReadFormat = getReadFormat;
exports.readUint8 = uint8;

var BufferLite = require("./buffer-lite");
var Bufferish = require("./bufferish");

var IS_BUFFER_SHIM = ("TYPED_ARRAY_SUPPORT" in Buffer);
var HAS_UINT8ARRAY = ("undefined" !== typeof Uint8Array);
var NO_ASSERT = true;

function getReadFormat(options) {
  var binarraybuffer = HAS_UINT8ARRAY && options && options.binarraybuffer;
  var int64 = options && options.int64;

  var readFormat = {
    map: map,
    array: array,
    str: str,
    bin: (binarraybuffer ? bin_arraybuffer : bin_buffer),
    ext: ext,
    uint8: uint8,
    uint16: uint16,
    uint32: read(4, Buffer.prototype.readUInt32BE),
    uint64: read(8, int64 ? readUInt64BE_int64 : readUInt64BE),
    int8: read(1, Buffer.prototype.readInt8),
    int16: read(2, Buffer.prototype.readInt16BE),
    int32: read(4, Buffer.prototype.readInt32BE),
    int64: read(8, int64 ? readInt64BE_int64 : readInt64BE),
    float32: read(4, Bufferish.prototype.readFloatBE),
    float64: read(8, Bufferish.prototype.readDoubleBE)
  };

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
  var start = decoder.reserve(len);
  var end = start + len;
  var buffer = decoder.buffer;
  if (IS_BUFFER_SHIM || !Buffer.isBuffer(buffer)) {
    // slower (compat)
    return BufferLite.readString.call(buffer, start, end);
  } else {
    // 2x faster
    return buffer.toString("utf-8", start, end);
  }
}

function bin_buffer(decoder, len) {
  var start = decoder.reserve(len);
  var end = start + len;
  return slice.call(decoder.buffer, start, end);
}

function bin_arraybuffer(decoder, len) {
  var start = decoder.reserve(len);
  var end = start + len;
  var buf = new Uint8Array(len);
  Bufferish.prototype.copy.call(decoder.buffer, buf, 0, start, end);
  return buf.buffer;
}

function ext(decoder, len) {
  var start = decoder.reserve(len);
  var type = decoder.buffer[start++];
  var end = start + len;
  var unpack = decoder.codec.getExtUnpacker(type);
  if (!unpack) throw new Error("Invalid ext type: " + (type ? ("0x" + type.toString(16)) : type));
  var buf = slice.call(decoder.buffer, start, end);
  return unpack(buf);
}

function uint8(decoder) {
  var start = decoder.reserve(1);
  return decoder.buffer[start];
}

function uint16(decoder) {
  var start = decoder.reserve(2);
  var buffer = decoder.buffer;
  return (buffer[start++] << 8) | buffer[start];
}

function read(len, method) {
  return function(decoder) {
    var start = decoder.reserve(len);
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

/**
 * @param [start] {Number}
 * @param [end] {Number}
 * @returns {Buffer}
 */

function slice(start, end) {
  var f = this.slice || Array.prototype.slice;
  var buf = f.call(this, start, end);
  if (!Buffer.isBuffer(buf)) buf = Buffer(buf);
  return buf;
}
