// util.js

var Int64Buffer = require("int64-buffer");
var Uint64BE = Int64Buffer.Uint64BE;
var Int64BE = Int64Buffer.Int64BE;

var MAXBUFLEN = 8192;

exports.writeString = writeString;
exports.readString = readString;
exports.byteLength = byteLength;
exports.copy = copy;
exports.writeUint64BE = writeUint64BE;
exports.writeInt64BE = writeInt64BE;

// new Buffer(string, "utf-8") is SLOWER then below

function writeString(string, start) {
  var buffer = this;
  var index = start || 0;
  var length = string.length;
  // JavaScript's string uses UTF-16 surrogate pairs for characters other than BMP.
  // This encodes string as CESU-8 which never reaches 4 octets per character.
  for (var i = 0; i < length; i++) {
    var chr = string.charCodeAt(i);
    if (chr < 0x80) {
      buffer[index++] = chr;
    } else if (chr < 0x800) {
      buffer[index++] = 0xC0 | (chr >> 6);
      buffer[index++] = 0x80 | (chr & 0x3F);
    } else {
      buffer[index++] = 0xE0 | (chr >> 12);
      buffer[index++] = 0x80 | ((chr >> 6) & 0x3F);
      buffer[index++] = 0x80 | (chr & 0x3F);
    }
  }
  return index - start;
}

// Buffer.ptototype.toString is 2x FASTER then below
// https://github.com/feross/buffer may throw "Maximum call stack size exceeded." at String.fromCharCode.apply.

function readString(start, end) {
  var buffer = this;
  var index = start - 0 || 0;
  if (!end) end = buffer.length;
  var size = end - start;
  if (size > MAXBUFLEN) size = MAXBUFLEN;
  var out = [];
  for (; index < end;) {
    var array = new Array(size);
    for (var pos = 0; pos < size && index < end;) {
      var chr = buffer[index++];
      chr = (chr < 0x80) ? chr :
        (chr < 0xE0) ? (((chr & 0x3F) << 6) | (buffer[index++] & 0x3F)) :
          (((chr & 0x3F) << 12) | ((buffer[index++] & 0x3F) << 6) | ((buffer[index++] & 0x3F)));
      array[pos++] = chr;
    }
    if (pos < size) array = array.slice(0, pos);
    out.push(String.fromCharCode.apply("", array));
  }
  return (out.length > 1) ? out.join("") : out.length ? out.shift() : "";
}

// Buffer.byteLength is FASTER than below

function byteLength(string) {
  var length = 0 | 0;
  Array.prototype.forEach.call(string, function(chr) {
    var code = chr.charCodeAt(0);
    length += (code < 0x80) ? 1 : (code < 0x800) ? 2 : 3;
  });
  return length;
}

// https://github.com/feross/buffer lacks descending copying feature

function copy(target, targetStart, start, end) {
  var i;
  if (!start) start = 0;
  if (!end && end !== 0) end = this.length;
  if (!targetStart) targetStart = 0;
  var len = end - start;

  if (target === this && start < targetStart && targetStart < end) {
    // descending
    for (i = len - 1; i >= 0; i--) {
      target[i + targetStart] = this[i + start];
    }
  } else {
    // ascending
    for (i = 0; i < len; i++) {
      target[i + targetStart] = this[i + start];
    }
  }

  return len;
}

function writeUint64BE(value, offset) {
  new Uint64BE(this, offset, value);
}

function writeInt64BE(value, offset) {
  new Int64BE(this, offset, value);
}
